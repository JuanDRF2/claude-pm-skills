#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { findInvalidPublishedMarkdownLinks } from "./markdown-transport.mjs";

const HEX64 = /^[0-9a-f]{64}$/;
const ALLOWED_VERDICTS = new Set(["PASS", "PASS WITH OBSERVATIONS", "PASS CON OBSERVACIONES"]);

function fail(message) {
  process.stderr.write(`ERROR: ${message}\n`);
  process.exitCode = 1;
}

function digest(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function requireString(value, label, errors) {
  if (typeof value !== "string" || !value.trim()) errors.push(`${label} must be a non-empty string`);
}

function requireHash(value, label, errors) {
  if (typeof value !== "string" || !HEX64.test(value)) errors.push(`${label} must be a lowercase SHA-256`);
}

function safeFile(root, relative, label, errors) {
  requireString(relative, label, errors);
  if (typeof relative !== "string" || !relative.trim()) return null;
  if (path.isAbsolute(relative)) {
    errors.push(`${label} must be relative to --root`);
    return null;
  }
  const resolved = path.resolve(root, relative);
  const prefix = root.endsWith(path.sep) ? root : `${root}${path.sep}`;
  if (resolved !== root && !resolved.startsWith(prefix)) {
    errors.push(`${label} escapes --root`);
    return null;
  }
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    errors.push(`${label} does not exist: ${relative}`);
    return null;
  }
  return resolved;
}

function validatePatchPlan(item, label, errors) {
  if (item.strategy !== "patch") return;
  const plan = item.patch_plan;
  if (!plan || plan.strategy !== "patch") {
    errors.push(`${label}.patch_plan is required for patch strategy`);
    return;
  }
  if (plan.anchor_occurrences !== 1) errors.push(`${label}.patch_plan must have one unique anchor`);
  for (const field of ["old_fragment_sha256", "new_fragment_sha256", "target_sha256"]) {
    requireHash(plan[field], `${label}.patch_plan.${field}`, errors);
  }
  if (plan.target_sha256 !== item.target_sha256) errors.push(`${label}.patch_plan.target_sha256 must match target_sha256`);
}

function parseJudge(text, label, errors) {
  const verdict = text.match(
    /^-\s*(?:Verdict|Veredicto)(?:\s*\/\s*(?:Verdict|Veredicto))?\s*:\s*(PASS WITH OBSERVATIONS|PASS CON OBSERVACIONES|PASS|FAIL)\s*$/im,
  )?.[1];
  const stage = text.match(
    /^-\s*(?:Action stage|Etapa de acción)(?:\s*\/\s*(?:Action stage|Etapa de acción))?\s*:\s*([^\n]+)$/im,
  )?.[1]?.trim();
  const scope = text.match(
    /^-\s*(?:Action scope|Alcance de acción)(?:\s*\/\s*(?:Action scope|Alcance de acción))?\s*:\s*technical\s*=\s*(\d+)\s*;\s*editorial\s*=\s*(\d+)\s*$/im,
  );
  if (!verdict) errors.push(`${label} is missing a supported verdict`);
  if (verdict && !ALLOWED_VERDICTS.has(verdict)) errors.push(`${label} verdict does not permit publication: ${verdict}`);
  if (stage?.toLowerCase() !== "publication") errors.push(`${label} must declare Action stage / Etapa de acción: Publication`);
  if (!scope) errors.push(`${label} must declare Action scope / Alcance de acción: technical=N; editorial=N`);

  const headings = [...text.matchAll(/^###\s+(JUDGE-[A-Z0-9]+-\d{3,})\b/gm)];
  const openFindings = [];
  for (let index = 0; index < headings.length; index += 1) {
    const start = headings[index].index;
    const end = headings[index + 1]?.index ?? text.length;
    const block = text.slice(start, end);
    const id = headings[index][1];
    const severity = block.match(/^\s*-\s*(?:Severity|Severidad)(?:\s*\/\s*(?:Severity|Severidad))?\s*:\s*(Critical|High|Medium|Low|Observation)\s*$/im)?.[1];
    const status = block.match(/^\s*-\s*(?:Status|Estado)(?:\s*\/\s*(?:Status|Estado))?\s*:\s*(Open|Resolved|Accepted risk|Not reproducible|Superseded)\s*$/im)?.[1];
    const blocks = block.match(/^\s*-\s*(?:Blocks action|Bloquea acción)(?:\s*\/\s*(?:Blocks action|Bloquea acción))?\s*:\s*(Yes|No|Sí)\s*$/im)?.[1];
    if (!severity || !status || !blocks) continue;
    if (status === "Open") {
      const blockingSeverity = ["Critical", "High", "Medium"].includes(severity);
      const saysBlocking = blocks === "Yes" || blocks === "Sí";
      if (blockingSeverity !== saysBlocking) {
        errors.push(`${label} ${id} has inconsistent severity and Blocks action`);
      }
      openFindings.push({ id, severity });
    }
  }

  const blocking = openFindings.filter((item) => ["Critical", "High", "Medium"].includes(item.severity));
  const observations = openFindings.filter((item) => ["Low", "Observation"].includes(item.severity));
  if (blocking.length && verdict !== "FAIL") errors.push(`${label} must be FAIL with open blocking findings`);
  if (!blocking.length && observations.length && verdict === "PASS") errors.push(`${label} must retain an observations verdict`);
  if (!openFindings.length && verdict && verdict !== "PASS") errors.push(`${label} must be PASS when it has no open findings`);

  return {
    verdict,
    technicalCount: scope ? Number(scope[1]) : null,
    editorialCount: scope ? Number(scope[2]) : null,
  };
}

function main() {
  const args = process.argv.slice(2);
  const dossierArg = args[0];
  const rootIndex = args.indexOf("--root");
  const rootArg = rootIndex >= 0 ? args[rootIndex + 1] : null;
  if (!dossierArg || !rootArg) {
    fail("Usage: validate-publication-dossier.mjs <publication-dossier.json> --root <workspace-root>");
    return;
  }

  const root = path.resolve(rootArg);
  const dossierPath = path.resolve(dossierArg);
  if (!fs.existsSync(dossierPath)) {
    fail(`Dossier does not exist: ${dossierPath}`);
    return;
  }

  const raw = fs.readFileSync(dossierPath);
  let dossier;
  try {
    dossier = JSON.parse(raw.toString("utf8"));
  } catch (error) {
    fail(`Invalid JSON: ${error.message}`);
    return;
  }

  const errors = [];
  if (![2, 3].includes(dossier.schema_version)) errors.push("schema_version must be 2 or 3");
  if (dossier.intended_action !== "notion_localized_publication") errors.push("intended_action must be notion_localized_publication");
  if (dossier.authorization_status !== "pending") errors.push("authorization_status must be pending");

  if (dossier.schema_version === 2 && dossier.verification_pages === undefined) dossier.verification_pages = [];
  const arrays = ["technical_pages", "editorial_pages", "verification_pages", "excluded_units", "judge_reports", "freshness_receipts", "audit_entries"];
  for (const key of arrays) if (!Array.isArray(dossier[key])) errors.push(`${key} must be an array`);
  if (errors.length) {
    for (const error of errors) fail(error);
    return;
  }

  const remoteIds = new Set();
  const unitKeys = new Set();
  const projects = new Map();
  const verificationProjects = new Set();
  const countProject = (project, kind) => {
    if (!projects.has(project)) projects.set(project, { technical: 0, editorial: 0 });
    projects.get(project)[kind] += 1;
  };

  for (const [index, item] of dossier.technical_pages.entries()) {
    const label = `technical_pages[${index}]`;
    for (const field of ["project", "unit_id", "notion_page_id", "strategy", "source_path"]) requireString(item[field], `${label}.${field}`, errors);
    if (!["patch", "replace"].includes(item.strategy)) errors.push(`${label}.strategy must be patch or replace`);
    validatePatchPlan(item, label, errors);
    requireHash(item.remote_sha256, `${label}.remote_sha256`, errors);
    requireHash(item.target_sha256, `${label}.target_sha256`, errors);
    if (item.remote_sha256 === item.target_sha256) errors.push(`${label} is a no-op and must move to verification_pages`);
    const source = safeFile(root, item.source_path, `${label}.source_path`, errors);
    if (source) {
      const body = fs.readFileSync(source);
      if (digest(body) !== item.target_sha256) errors.push(`${label}.target_sha256 does not match source_path`);
      const invalidLinks = findInvalidPublishedMarkdownLinks(body);
      if (invalidLinks.length) errors.push(`${label}.source_path contains invalid published Markdown URL(s): ${invalidLinks.join(", ")}`);
    }
    const unitKey = `${item.project}::${item.unit_id}`;
    if (unitKeys.has(unitKey)) errors.push(`${label} duplicates unit ${unitKey}`);
    unitKeys.add(unitKey);
    if (remoteIds.has(item.notion_page_id)) errors.push(`${label} duplicates notion_page_id ${item.notion_page_id}`);
    remoteIds.add(item.notion_page_id);
    countProject(item.project, "technical");
  }

  for (const [index, item] of dossier.editorial_pages.entries()) {
    const label = `editorial_pages[${index}]`;
    for (const field of ["project", "presentation_id", "notion_page_id", "classification", "strategy", "payload_path", "reason"]) requireString(item[field], `${label}.${field}`, errors);
    if (!["update-complete", "summary-link"].includes(item.classification)) errors.push(`${label}.classification is unsupported`);
    if (!["patch", "replace"].includes(item.strategy)) errors.push(`${label}.strategy must be patch or replace`);
    validatePatchPlan(item, label, errors);
    if (!Array.isArray(item.source_ids) || !item.source_ids.length || item.source_ids.some((value) => typeof value !== "string" || !value.trim())) {
      errors.push(`${label}.source_ids must contain at least one stable source ID`);
    }
    requireHash(item.remote_sha256, `${label}.remote_sha256`, errors);
    requireHash(item.target_sha256, `${label}.target_sha256`, errors);
    if (item.remote_sha256 === item.target_sha256) errors.push(`${label} is a no-op and must move to verification_pages`);
    const payload = safeFile(root, item.payload_path, `${label}.payload_path`, errors);
    if (payload) {
      const body = fs.readFileSync(payload);
      if (digest(body) !== item.target_sha256) errors.push(`${label}.target_sha256 does not match payload_path`);
      const invalidLinks = findInvalidPublishedMarkdownLinks(body);
      if (invalidLinks.length) errors.push(`${label}.payload_path contains invalid published Markdown URL(s): ${invalidLinks.join(", ")}`);
    }
    if (remoteIds.has(item.notion_page_id)) errors.push(`${label} duplicates notion_page_id ${item.notion_page_id}`);
    remoteIds.add(item.notion_page_id);
    countProject(item.project, "editorial");
  }

  for (const [index, item] of dossier.verification_pages.entries()) {
    const label = `verification_pages[${index}]`;
    for (const field of ["project", "page_type", "identity", "notion_page_id", "payload_path", "reason"]) {
      requireString(item[field], `${label}.${field}`, errors);
    }
    if (!["technical", "editorial"].includes(item.page_type)) errors.push(`${label}.page_type must be technical or editorial`);
    requireHash(item.remote_sha256, `${label}.remote_sha256`, errors);
    requireHash(item.target_sha256, `${label}.target_sha256`, errors);
    if (item.remote_sha256 !== item.target_sha256) errors.push(`${label} is not a no-op: remote_sha256 must equal target_sha256`);
    const payload = safeFile(root, item.payload_path, `${label}.payload_path`, errors);
    if (payload) {
      const body = fs.readFileSync(payload);
      if (digest(body) !== item.target_sha256) errors.push(`${label}.target_sha256 does not match payload_path`);
      const invalidLinks = findInvalidPublishedMarkdownLinks(body);
      if (invalidLinks.length) errors.push(`${label}.payload_path contains invalid published Markdown URL(s): ${invalidLinks.join(", ")}`);
    }
    const unitKey = `${item.project}::${item.identity}`;
    if (unitKeys.has(unitKey)) errors.push(`${label} overlaps another unit: ${unitKey}`);
    unitKeys.add(unitKey);
    if (remoteIds.has(item.notion_page_id)) errors.push(`${label} duplicates notion_page_id ${item.notion_page_id}`);
    remoteIds.add(item.notion_page_id);
    verificationProjects.add(item.project);
  }

  for (const [index, item] of dossier.excluded_units.entries()) {
    const label = `excluded_units[${index}]`;
    for (const field of ["project", "unit_id", "classification"]) requireString(item[field], `${label}.${field}`, errors);
    if (!["historical_out_of_scope", "deferred", "rejected"].includes(item.classification)) errors.push(`${label}.classification is unsupported`);
    requireHash(item.local_sha256, `${label}.local_sha256`, errors);
    requireHash(item.remote_sha256, `${label}.remote_sha256`, errors);
    const unitKey = `${item.project}::${item.unit_id}`;
    if (unitKeys.has(unitKey)) errors.push(`${label} overlaps the technical write set: ${unitKey}`);
    unitKeys.add(unitKey);
  }

  const judgesByProject = new Map();
  for (const [index, item] of dossier.judge_reports.entries()) {
    const label = `judge_reports[${index}]`;
    requireString(item.project, `${label}.project`, errors);
    requireHash(item.report_sha256, `${label}.report_sha256`, errors);
    if (!Number.isInteger(item.technical_count) || item.technical_count < 0) errors.push(`${label}.technical_count must be a non-negative integer`);
    if (!Number.isInteger(item.editorial_count) || item.editorial_count < 0) errors.push(`${label}.editorial_count must be a non-negative integer`);
    const report = safeFile(root, item.report_path, `${label}.report_path`, errors);
    if (report) {
      const bytes = fs.readFileSync(report);
      if (digest(bytes) !== item.report_sha256) errors.push(`${label}.report_sha256 does not match report_path`);
      const parsed = parseJudge(bytes.toString("utf8"), label, errors);
      if (parsed.technicalCount !== item.technical_count || parsed.editorialCount !== item.editorial_count) {
        errors.push(`${label} declared counts do not match the Judge action scope`);
      }
    }
    if (judgesByProject.has(item.project)) errors.push(`${label} duplicates project ${item.project}`);
    judgesByProject.set(item.project, item);
  }

  for (const [project, counts] of projects) {
    const judge = judgesByProject.get(project);
    if (!judge) {
      errors.push(`Missing Judge report for project ${project}`);
      continue;
    }
    if (judge.technical_count !== counts.technical || judge.editorial_count !== counts.editorial) {
      errors.push(`Judge scope for ${project} does not match dossier counts`);
    }
  }

  const receiptsByProject = new Map();
  let freshnessPages = 0;
  for (const [index, item] of dossier.freshness_receipts.entries()) {
    const label = `freshness_receipts[${index}]`;
    requireString(item.project, `${label}.project`, errors);
    requireHash(item.receipt_sha256, `${label}.receipt_sha256`, errors);
    if (!Number.isInteger(item.expected_page_count) || item.expected_page_count <= 0) {
      errors.push(`${label}.expected_page_count must be a positive integer`);
    }
    const receiptFile = safeFile(root, item.receipt_path, `${label}.receipt_path`, errors);
    if (receiptFile) {
      const receiptBytes = fs.readFileSync(receiptFile);
      if (digest(receiptBytes) !== item.receipt_sha256) errors.push(`${label}.receipt_sha256 does not match receipt_path`);
      let receipt;
      try {
        receipt = JSON.parse(receiptBytes.toString("utf8"));
      } catch (error) {
        errors.push(`${label}.receipt_path is not valid JSON: ${error.message}`);
      }
      if (receipt) {
        const localized = receipt.operation === "native-pages-fast-preflight";
        const legacyFull = receipt.operation === "review-session-check";
        if (receipt.ok !== true || receipt.current !== true || (!localized && !legacyFull)) {
          errors.push(`${label} must be a successful current freshness receipt`);
        }
        if (receipt.project !== item.project) errors.push(`${label}.project does not match the receipt`);
        if (receipt.checked_pages !== item.expected_page_count) errors.push(`${label}.checked_pages does not match expected_page_count`);
        if (localized && receipt.verification_scope !== "localized") errors.push(`${label} localized receipt must declare verification_scope=localized`);
        if (legacyFull) {
          if (!Array.isArray(receipt.changed) || receipt.changed.length !== 0) errors.push(`${label}.changed must be empty`);
          if (receipt.manifest_page_count !== item.expected_page_count) errors.push(`${label}.manifest_page_count does not match expected_page_count`);
          requireHash(receipt.freshness_evidence_sha256, `${label}.freshness_evidence_sha256`, errors);
          requireHash(receipt.manifest_sha256, `${label}.manifest_sha256`, errors);
          requireHash(receipt.remote_snapshot, `${label}.remote_snapshot`, errors);
          requireString(receipt.checked_at, `${label}.checked_at`, errors);
          const manifestFile = safeFile(root, receipt.manifest_file, `${label}.manifest_file`, errors);
          if (manifestFile) {
            const manifestBytes = fs.readFileSync(manifestFile);
            if (digest(manifestBytes) !== receipt.manifest_sha256) errors.push(`${label}.manifest_sha256 does not match manifest_file`);
          }
        }
      }
    }
    if (receiptsByProject.has(item.project)) errors.push(`${label} duplicates project ${item.project}`);
    receiptsByProject.set(item.project, item);
    if (Number.isInteger(item.expected_page_count)) freshnessPages += item.expected_page_count;
  }

  const freshnessProjects = new Set([...projects.keys(), ...verificationProjects]);
  for (const project of freshnessProjects) {
    if (!receiptsByProject.has(project)) errors.push(`Missing freshness receipt for affected scope in project ${project}`);
  }
  for (const project of receiptsByProject.keys()) {
    if (!freshnessProjects.has(project)) errors.push(`Freshness receipt has no matching publication project: ${project}`);
  }

  for (const [index, item] of dossier.audit_entries.entries()) {
    const label = `audit_entries[${index}]`;
    for (const field of ["project", "parent_page_id"]) requireString(item[field], `${label}.${field}`, errors);
    if (item.trigger !== "verified_readback") errors.push(`${label}.trigger must be verified_readback`);
    if (item.payload_source !== "verified_receipt") errors.push(`${label}.payload_source must be verified_receipt`);
  }

  const controls = dossier.controls ?? {};
  for (const key of ["freshness_before_write", "full_readback_written_pages", "backup_before_write", "rollback_from_backup"]) {
    if (controls[key] !== true) errors.push(`controls.${key} must be true`);
  }

  const totals = {
    technical_pages: dossier.technical_pages.length,
    editorial_pages: dossier.editorial_pages.length,
    verification_pages: dossier.verification_pages.length,
    excluded_units: dossier.excluded_units.length,
    freshness_pages: freshnessPages,
    audit_entries: dossier.audit_entries.length,
  };
  const totalsToValidate = dossier.schema_version === 2
    ? Object.entries(totals).filter(([key]) => key !== "verification_pages")
    : Object.entries(totals);
  for (const [key, value] of totalsToValidate) {
    if (dossier.expected_totals?.[key] !== value) errors.push(`expected_totals.${key} must equal ${value}`);
  }

  if (errors.length) {
    for (const error of errors) fail(error);
    process.stderr.write(`FAILED: ${errors.length} error(s)\n`);
    return;
  }

  process.stdout.write(`OK: publication dossier is complete (${totals.technical_pages} technical, ${totals.editorial_pages} editorial, ${totals.verification_pages} verification-only, ${totals.excluded_units} excluded, ${totals.freshness_pages} freshness pages, ${totals.audit_entries} conditional audits)\n`);
  process.stdout.write(`DOSSIER_SHA256: ${digest(raw)}\n`);
}

main();
