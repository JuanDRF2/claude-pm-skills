#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const value = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
};
const planPath = value("--plan");
const outPath = value("--out");
if (!planPath || !outPath) {
  console.error("Usage: validate-notion-presentation.mjs --plan <json> --out <receipt.json>");
  process.exit(2);
}

const read = (file) => fs.readFileSync(path.resolve(file), "utf8");
const unique = (items) => [...new Set(items)];
const unwrap = (raw) => {
  let body = raw;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed.text === "string") body = parsed.text;
  } catch {
    // Raw enhanced Markdown is supported.
  }
  const content = body.match(/<content>\s*([\s\S]*?)\s*<\/content>/i);
  return (content ? content[1] : body).replace(/\r\n?/g, "\n");
};
const ids = (body, prefix) =>
  unique([...body.matchAll(new RegExp(`\\b${prefix}-[A-Z0-9]+(?:-[A-Z0-9]+)*\\b`, "g"))].map((match) => match[0]));
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const section = (body, number) => {
  const lines = body.split("\n");
  const start = lines.findIndex((line) => new RegExp(`^##\\s+${number}\\.\\s+`).test(line));
  if (start < 0) return "";
  const end = lines.findIndex((line, index) => index > start && new RegExp(`^##\\s+${number + 1}\\.\\s+`).test(line));
  return lines.slice(start, end < 0 ? lines.length : end).join("\n");
};
const hasLinkFor = (body, id) => {
  const escaped = escapeRegExp(id);
  return new RegExp(`\\[[^\\]]*${escaped}[^\\]]*\\]\\(https?://[^)]+\\)`, "i").test(body)
    || new RegExp(`<mention-page[^>]+url="[^"]+"[^>]*>[^<]*${escaped}`, "i").test(body)
    || new RegExp(`<page[^>]+url="[^"]+"[^>]*>[^<]*${escaped}`, "i").test(body);
};

const detailBlocks = (body) => {
  const lines = body.split("\n");
  const stack = [];
  const blocks = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (/^\s*<details>\s*$/i.test(lines[index])) {
      stack.push({ start: index, summary: "" });
      continue;
    }
    const summary = lines[index].match(/^\s*<summary>([\s\S]*?)<\/summary>\s*$/i);
    if (summary && stack.length) stack.at(-1).summary = summary[1].trim();
    if (/^\s*<\/details>\s*$/i.test(lines[index]) && stack.length) {
      const opened = stack.pop();
      blocks.push({ summary: opened.summary, body: lines.slice(opened.start, index + 1).join("\n") });
    }
  }
  return blocks;
};

const canonicalCriteria = (body) => {
  const lines = body.split("\n");
  const result = new Map();
  for (let index = 0; index < lines.length; index += 1) {
    const heading = lines[index].match(/^\s*(#{2,6})\s+.*?\b(AC-[A-Z0-9]+(?:-[A-Z0-9]+)*)\b/);
    if (!heading) continue;
    const level = heading[1].length;
    let end = index + 1;
    while (end < lines.length) {
      const next = lines[end].match(/^\s*(#{1,6})\s+/);
      if (next && next[1].length <= level) break;
      end += 1;
    }
    result.set(heading[2], lines.slice(index, end).join("\n"));
  }
  return result;
};

const checkCover = (item, body) => {
  const errors = [];
  const expectedHeadings = [
    "Objetivo", "Estado y readiness", "Refinement Judge", "Inventario", "Alcance",
    "Decisiones críticas", "Índice de historias", "Pendientes y riesgos",
    "Paquete Markdown y materiales", "Próximo paso",
  ];
  const numbered = [...body.matchAll(/^##\s+(\d+)\.\s+([^\n]+)$/gm)].map((match) => ({ number: Number(match[1]), title: match[2].trim() }));
  if (numbered.length !== 10) errors.push({ code: "COVER_SECTION_COUNT", message: "La portada debe tener exactamente diez secciones numeradas." });
  expectedHeadings.forEach((title, index) => {
    const actual = numbered[index];
    if (!actual || actual.number !== index + 1 || actual.title !== title) {
      errors.push({ code: "COVER_SECTION_ORDER", message: `Se esperaba ## ${index + 1}. ${title}.` });
    }
  });

  const details = detailBlocks(body).filter((block) => block.summary === "Subpáginas internas del proyecto");
  if (details.length !== 1) errors.push({ code: "COVER_CHILD_CONTAINER", message: "Debe existir un único desplegable Subpáginas internas del proyecto." });
  const headingTen = body.search(/^##\s+10\.\s+/m);
  const containerStart = body.search(/^\s*<details>\s*\n\s*<summary>Subpáginas internas del proyecto<\/summary>/mi);
  if (headingTen >= 0) {
    const tail = body.slice(headingTen, containerStart > headingTen ? containerStart : undefined);
    const extraHeadings = [...tail.matchAll(/^##\s+([^\n]+)$/gm)].slice(1);
    if (extraHeadings.length) errors.push({ code: "COVER_EXTRA_SECTIONS", message: "Hay secciones paralelas después de ## 10. Próximo paso." });
  }
  const pageBlocks = [...body.matchAll(/<page\b[\s\S]*?<\/page>/gi)].map((match) => match[0]);
  const containerBody = details[0]?.body || "";
  const loosePages = pageBlocks.filter((block) => !containerBody.includes(block));
  if (loosePages.length) errors.push({ code: "COVER_LOOSE_CHILD_PAGES", message: `Hay ${loosePages.length} subpáginas fuera del contenedor final.` });

  const storyIndex = section(body, 7);
  for (const storyId of item.expected_story_ids || []) {
    if (!hasLinkFor(storyIndex, storyId)) errors.push({ code: "COVER_STORY_LINK", id: storyId, message: `Falta el enlace visible de ${storyId}.` });
  }
  const materials = section(body, 9);
  const requiredMaterials = [
    "Reglas, decisiones y preguntas", "Plan funcional de pruebas",
    "Matriz de cobertura y automatización", "Pendientes, riesgos y preparación",
    "Handoff DEV", "Handoff QA", "Abrir Paquete Markdown nativo",
    "Historial de sincronización",
  ];
  for (const label of requiredMaterials) {
    if (!hasLinkFor(materials, label)) {
      errors.push({ code: "COVER_MATERIAL_LINK", label, message: `Falta un enlace funcional para ${label}.` });
    }
  }
  const destination = String(item.development_destination || "").trim();
  if (destination) {
    const destinationHandoff = new RegExp(
      `\\*\\*Destino de desarrollo:\\*\\*\\s*${escapeRegExp(destination)}\\s*[—-]\\s*\\[[^\\]]*Handoff DEV[^\\]]*\\]\\(https?:\\/\\/[^)]+\\)`,
      "i",
    );
    if (!destinationHandoff.test(materials)) {
      errors.push({
        code: "COVER_DEVELOPMENT_DESTINATION",
        message: `${destination} está confirmado pero falta la nota enlazada a Handoff DEV en la sección 9.`,
      });
    }
  }
  if (!/Baseline verificado\s*:\*{0,2}\s*`?[0-9a-f]{64}`?\b/i.test(materials)) errors.push({ code: "COVER_BASELINE_HASH", message: "Falta el hash completo del baseline verificado." });
  if (!/Snapshot del manifiesto\s*:\*{0,2}\s*`?[0-9a-f]{64}`?\b/i.test(materials)) errors.push({ code: "COVER_MANIFEST_HASH", message: "Falta el snapshot completo del manifiesto." });
  return errors;
};

const checkSharedContractCover = (body) => {
  const errors = [];
  const expectedHeadings = [
    "Autoridad y alcance",
    "Comportamiento aprobado",
    "Decisiones todavía abiertas",
    "Paquetes consumidores",
    "Gobierno de cambios",
    "Material técnico",
    "Operación y auditoría",
  ];
  const headings = [...body.matchAll(/^##\s+([^\n]+)$/gm)].map((match) => match[1].trim());
  if (headings.length !== expectedHeadings.length) {
    errors.push({ code: "SHARED_COVER_SECTION_COUNT", message: "La portada de contrato compartido debe tener exactamente siete secciones principales." });
  }
  expectedHeadings.forEach((title, index) => {
    if (headings[index] !== title) {
      errors.push({ code: "SHARED_COVER_SECTION_ORDER", message: `Se esperaba ## ${title} en la posición ${index + 1}.` });
    }
  });
  if (!/<callout\b[\s\S]*?<\/callout>/i.test(body)) {
    errors.push({ code: "SHARED_COVER_CALLOUT", message: "Falta el resumen visible de estado, propietario, consumidores y regla de cambio." });
  }
  for (const label of ["Estado", "Propietario", "Consumidores", "Regla de cambio"]) {
    if (!new RegExp(`\\*\\*${escapeRegExp(label)}:\\*\\*\\s*\\S`, "i").test(body)) {
      errors.push({ code: "SHARED_COVER_SUMMARY_FIELD", label, message: `Falta ${label} en el resumen del contrato compartido.` });
    }
  }
  for (const label of ["Proyecto", "Estado", "Última actualización", "Aprobado hasta"]) {
    if (!new RegExp(`^-\\s*${escapeRegExp(label)}:\\s*\\S`, "mi").test(body)) {
      errors.push({ code: "SHARED_COVER_METADATA", label, message: `Falta el metadato ${label}.` });
    }
  }
  for (const label of ["Paquete Markdown", "Historial de sincronización"]) {
    if (!hasLinkFor(body, label)) {
      errors.push({ code: "SHARED_COVER_OPERATION_LINK", label, message: `Falta un enlace funcional para ${label}.` });
    }
  }
  if (!/^##\s+Paquetes consumidores\s*$[\s\S]*?^\|\s*Paquete\s*\|/mi.test(body)) {
    errors.push({ code: "SHARED_COVER_CONSUMERS", message: "La portada debe mostrar la tabla de paquetes consumidores." });
  }
  return errors;
};

const checkStory = (item, body) => {
  const errors = [];
  const canonical = unwrap(read(item.canonical_path));
  const expectedSections = [
    "Historia y valor", "Estado y preparación", "Alcance", "Comportamiento acordado",
    "Dependencias, supuestos y preguntas", "Criterios de aceptación y cobertura QA",
    "Casos funcionales relacionados", "Pendientes, riesgos y calidad",
    "Trazabilidad y próximo paso",
  ];
  const numbered = [...body.matchAll(/^##\s+(\d+)\.\s+([^\n]+)$/gm)].map((match) => ({ number: Number(match[1]), title: match[2].trim() }));
  expectedSections.forEach((title, index) => {
    const actual = numbered[index];
    if (!actual || actual.number !== index + 1 || actual.title !== title) {
      errors.push({ code: "STORY_SECTION_ORDER", message: `Se esperaba ## ${index + 1}. ${title}.` });
    }
  });
  if (numbered.length !== expectedSections.length) errors.push({ code: "STORY_SECTION_COUNT", message: `La historia debe tener exactamente ${expectedSections.length} secciones numeradas.` });

  const canonicalIds = Object.fromEntries(["AC", "SC", "CHK", "FTC"].map((prefix) => [prefix, ids(canonical, prefix)]));
  for (const [prefix, expected] of Object.entries(canonicalIds)) {
    const actual = new Set(ids(body, prefix));
    for (const id of expected) if (!actual.has(id)) errors.push({ code: "STORY_MISSING_ID", id, message: `Falta ${id} en la presentación.` });
  }

  const details = detailBlocks(body);
  const criteria = canonicalCriteria(canonical);
  for (const [criterionId, canonicalBlock] of criteria) {
    const block = details.find((candidate) => new RegExp(`\\b${escapeRegExp(criterionId)}\\b`).test(candidate.summary));
    if (!block) {
      errors.push({ code: "STORY_CRITERION_TOGGLE", id: criterionId, message: `${criterionId} debe estar dentro de un desplegable.` });
      continue;
    }
    if (!/(?:Criterio de aceptaci[oó]n|Acceptance criterion)/i.test(block.summary)) errors.push({ code: "STORY_CRITERION_LABEL", id: criterionId, message: `${criterionId} debe mostrar su nombre humano, no solo la sigla.` });
    if (!/(?:Condici[oó]n de aceptaci[oó]n|Acceptance condition)\s*:/i.test(block.body)) errors.push({ code: "STORY_ACCEPTANCE_CONDITION", id: criterionId, message: `${criterionId} no muestra su condición de aceptación.` });
    if (!/(?:Reglas de negocio aplicables|Applicable business rules)/i.test(block.body)) errors.push({ code: "STORY_RULE_SECTION", id: criterionId, message: `${criterionId} no muestra las reglas aplicables completas.` });
    for (const ruleId of ids(canonicalBlock, "BR")) {
      const occurrence = block.body.match(new RegExp(`${escapeRegExp(ruleId)}[^\\n]{15,}`, "i"));
      if (!occurrence) errors.push({ code: "STORY_RULE_DEFINITION", id: ruleId, criterion_id: criterionId, message: `${ruleId} aparece sin definición completa dentro de ${criterionId}.` });
    }
    for (const scenarioId of ids(canonicalBlock, "SC")) {
      const scenario = details.find((candidate) => candidate.body !== block.body && block.body.includes(candidate.body) && new RegExp(`\\b${escapeRegExp(scenarioId)}\\b`).test(candidate.summary));
      if (!scenario || !/(?:Escenario can[oó]nico|Canonical scenario)/i.test(scenario.summary)) errors.push({ code: "STORY_SCENARIO_TOGGLE", id: scenarioId, criterion_id: criterionId, message: `${scenarioId} debe mostrarse como Escenario canónico dentro del criterio.` });
    }
    for (const checkId of ids(canonicalBlock, "CHK")) {
      if (!new RegExp(`(?:Comprobaci[oó]n de cobertura|Coverage check)[^\\n]*${escapeRegExp(checkId)}|${escapeRegExp(checkId)}[^\\n]*(?:Comprobaci[oó]n de cobertura|Coverage check)`, "i").test(block.body)) errors.push({ code: "STORY_CHECK_DETAIL", id: checkId, criterion_id: criterionId, message: `${checkId} debe mostrarse como Comprobación de cobertura dentro del criterio.` });
    }
    for (const caseId of ids(canonicalBlock, "FTC")) {
      if (!new RegExp(`(?:Caso funcional|Functional case)[^\\n]*${escapeRegExp(caseId)}|${escapeRegExp(caseId)}[^\\n]*(?:Caso funcional|Functional case)`, "i").test(block.body)) errors.push({ code: "STORY_CASE_RELATION", id: caseId, criterion_id: criterionId, message: `${caseId} debe mostrarse como Caso funcional relacionado.` });
    }
  }
  const tables = (body.match(/<table\b/gi) || []).length
    + (body.match(/^\s*\|(?:\s*:?-+:?\s*\|)+\s*$/gm) || []).length;
  if (tables > 1) errors.push({ code: "STORY_DUPLICATE_TABLES", message: "La historia debe usar una sola tabla compacta de trazabilidad." });
  return errors;
};

const plan = JSON.parse(read(planPath));
if (plan.schema_version !== 1 || !plan.project || !Array.isArray(plan.presentations) || !plan.presentations.length) {
  throw new Error("Presentation plan requires schema_version 1, project and presentations");
}
const results = plan.presentations.map((item) => {
  if (!item.presentation_path || !["cover", "shared-contract-cover", "story"].includes(item.type)) throw new Error("Each presentation requires a supported type and presentation_path");
  if (item.type === "story" && (!item.story_id || !item.canonical_path)) throw new Error("Story presentation requires story_id and canonical_path");
  const body = unwrap(read(item.presentation_path));
  const errors = item.type === "cover"
    ? checkCover(item, body)
    : item.type === "shared-contract-cover"
      ? checkSharedContractCover(body)
      : checkStory(item, body);
  return { type: item.type, identity: item.story_id || item.type, presentation_path: item.presentation_path, errors, ok: errors.length === 0 };
});
const receipt = {
  schema_version: 1,
  operation: "notion-presentation-format",
  project: plan.project,
  checked_at: new Date().toISOString(),
  presentations_expected: results.length,
  presentations_verified: results.filter((result) => result.ok).length,
  presentations: results,
  ok: results.every((result) => result.ok),
};
fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
fs.writeFileSync(path.resolve(outPath), `${JSON.stringify(receipt, null, 2)}\n`);
console.log(JSON.stringify(receipt, null, 2));
process.exit(receipt.ok ? 0 : 3);
