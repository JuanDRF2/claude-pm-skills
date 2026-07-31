#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const cli = path.resolve(
  process.argv[2] || new URL("./refinement-sync.mjs", import.meta.url).pathname,
);
const root = fs.mkdtempSync(path.join(os.tmpdir(), "refinement-sync-register-"));
const writeJson = (relative, value) => {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
  return file;
};
const run = (...args) =>
  spawnSync(process.execPath, [cli, ...args], {
    cwd: root,
    encoding: "utf8",
  });
const parse = (result) => JSON.parse(result.stdout || result.stderr);
const writeText = (relative, value) => {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
  return file;
};

try {
  const manifest = {
    schema_version: 1,
    project: "demo",
    package_kind: "project",
    notion_parent_page_id: "parent",
    notion_root_page_id: "root",
    notion_package_page_id: "package",
    audit_log_page_id: "audit",
    state_root: "artifacts/_local/notion-sync/demo",
    checkout_root: "artifacts/_local/notion-checkouts/demo",
    units: [
      {
        id: "00-workflow-state",
        role: "canonical",
        notion_page_id: "unit-00",
        local_path: "00-workflow-state.md",
      },
      {
        id: "US-DEMO-01",
        role: "derived",
        notion_page_id: "unit-us-01",
        local_path: "jira/US-DEMO-01.md",
      },
    ],
    presentations: [
      {
        id: "project-cover",
        role: "presentation",
        notion_page_id: "presentation-cover",
        remote_path: "_presentation/project-cover.md",
        drift_policy: "review",
      },
    ],
  };
  const hierarchy = {
    notion_root_page_id: "root",
    notion_root_parent_page_id: "parent",
    notion_package_page_id: "package",
    notion_package_parent_page_id: "root",
    audit_log_page_id: "audit",
    audit_log_parent_page_id: "root",
  };
  writeJson("candidate.json", manifest);
  writeJson("hierarchy.json", hierarchy);

  const preview = run(
    "register",
    "demo",
    "--preview",
    "--manifest",
    "candidate.json",
    "--hierarchy-evidence",
    "hierarchy.json",
  );
  assert.equal(preview.status, 0, preview.stderr);
  assert.equal(parse(preview).operation, "register-preview");
  assert.equal(fs.existsSync(path.join(root, "artifacts/_local/notion-sync/projects.json")), false);

  const apply = run(
    "register",
    "demo",
    "--apply",
    "--manifest",
    "candidate.json",
    "--hierarchy-evidence",
    "hierarchy.json",
  );
  assert.equal(apply.status, 0, apply.stderr);
  assert.equal(parse(apply).operation, "register-apply");
  const registry = JSON.parse(
    fs.readFileSync(path.join(root, "artifacts/_local/notion-sync/projects.json"), "utf8"),
  );
  assert.equal(registry.projects.demo.manifest_file, "candidate.json");
  assert.equal(registry.projects.demo.notion_root_page_id, "root");

  writeJson("bad-hierarchy.json", { ...hierarchy, notion_package_parent_page_id: "wrong" });
  const invalid = run(
    "register",
    "other",
    "--preview",
    "--manifest",
    "candidate.json",
    "--hierarchy-evidence",
    "bad-hierarchy.json",
  );
  assert.notEqual(invalid.status, 0);
  assert.equal(parse(invalid).message, "Registration validation failed");

  const containerManifest = {
    ...manifest,
    project: "demo-container",
    notion_internal_container_page_id: "internal",
    state_root: "artifacts/_local/notion-sync/demo-container",
    checkout_root: "artifacts/_local/notion-checkouts/demo-container",
  };
  const containerHierarchy = {
    ...hierarchy,
    notion_internal_container_page_id: "internal",
    notion_internal_container_parent_page_id: "root",
    notion_package_parent_page_id: "internal",
    audit_log_parent_page_id: "internal",
  };
  writeJson("container-candidate.json", containerManifest);
  writeJson("container-hierarchy.json", containerHierarchy);
  const containerPreview = run(
    "register",
    "demo-container",
    "--preview",
    "--manifest",
    "container-candidate.json",
    "--hierarchy-evidence",
    "container-hierarchy.json",
  );
  assert.equal(containerPreview.status, 0, containerPreview.stderr);
  assert.equal(parse(containerPreview).hierarchy_mode, "internal-container");

  writeJson("bad-container-hierarchy.json", {
    ...containerHierarchy,
    notion_internal_container_parent_page_id: "parent",
  });
  const invalidContainer = run(
    "register",
    "demo-container",
    "--preview",
    "--manifest",
    "container-candidate.json",
    "--hierarchy-evidence",
    "bad-container-hierarchy.json",
  );
  assert.notEqual(invalidContainer.status, 0);
  assert.equal(parse(invalidContainer).message, "Registration validation failed");

  const richRegistry = {
    schema_version: 1,
    projects: {
      "demo-container": {
        project: "demo-container",
        manifest_file: "container-candidate.json",
        state_root: containerManifest.state_root,
        checkout_root: containerManifest.checkout_root,
        notion_parent_page_id: "parent",
        notion_root_page_id: "root",
        notion_internal_container_page_id: "internal",
        notion_package_page_id: "package",
        units: [{ id: "preserve-me" }],
      },
    },
  };
  writeJson("rich-registry.json", richRegistry);
  const richApply = run(
    "register",
    "demo-container",
    "--apply",
    "--manifest",
    "container-candidate.json",
    "--hierarchy-evidence",
    "container-hierarchy.json",
    "--registry",
    "rich-registry.json",
  );
  assert.equal(richApply.status, 0, richApply.stderr);
  const richResult = JSON.parse(fs.readFileSync(path.join(root, "rich-registry.json"), "utf8"));
  assert.equal(richResult.projects["demo-container"].units[0].id, "preserve-me");

  const directTree = {
    root_id: "discover-root",
    parent_id: "destination",
    read_at: "2026-07-30T12:00:00Z",
    pages: [
      { id: "discover-root", title: "Demo refinement", parent_id: "destination" },
      { id: "discover-package", title: "📦 Paquete Markdown", parent_id: "discover-root" },
      { id: "discover-audit", title: "Historial de sincronización", parent_id: "discover-root" },
      { id: "discover-doc", title: "00-workflow-state", parent_id: "discover-package" },
      { id: "discover-jira", title: "jira", parent_id: "discover-package" },
      { id: "discover-story-file", title: "US-DEMO-01", parent_id: "discover-jira" },
      { id: "discover-handoffs", title: "handoffs", parent_id: "discover-package" },
      { id: "discover-handoff-file", title: "dev-handoff.md", parent_id: "discover-handoffs" },
      { id: "discover-story", title: "📖 US-DEMO-01 — Review", parent_id: "discover-root" },
      { id: "discover-rules", title: "Reglas y decisiones", parent_id: "discover-root" },
    ],
  };
  writeJson("direct-tree.json", directTree);
  const discoverPreview = run("discover", "discovered", "--tree", "direct-tree.json");
  assert.equal(discoverPreview.status, 0, discoverPreview.stderr);
  const discovered = parse(discoverPreview);
  assert.equal(discovered.operation, "discover-preview");
  assert.equal(discovered.hierarchy_mode, "direct-root");
  assert.equal(discovered.classification_complete, true);
  assert.equal(discovered.candidate_manifest.checkout_root, "artifacts/_local/notion-checkouts/discovered");
  assert.equal(discovered.candidate_manifest.units.length, 3);
  assert.equal(discovered.candidate_manifest.presentations.length, 3);
  assert.equal(fs.existsSync(path.join(root, "discover-output")), false);

  const discoverApply = run(
    "discover",
    "discovered",
    "--tree",
    "direct-tree.json",
    "--apply",
    "--out",
    "discover-output",
  );
  assert.equal(discoverApply.status, 0, discoverApply.stderr);
  const discoveredManifest = JSON.parse(
    fs.readFileSync(path.join(root, "discover-output/candidate-manifest.json"), "utf8"),
  );
  assert.equal(discoveredManifest.discovery.unclassified_pages.length, 0);
  const discoveredRegister = run(
    "register",
    "discovered",
    "--preview",
    "--manifest",
    "discover-output/candidate-manifest.json",
    "--hierarchy-evidence",
    "discover-output/hierarchy-evidence.json",
    "--registry",
    "discover-registry.json",
  );
  assert.equal(discoveredRegister.status, 0, discoveredRegister.stderr);

  const internalTree = {
    ...directTree,
    root_id: "internal-root",
    pages: directTree.pages.map((page) => {
      const id = page.id.replace("discover", "internal");
      let parent_id = page.parent_id.replace("discover", "internal");
      if (["internal-package", "internal-audit", "internal-story", "internal-rules"].includes(id)) {
        parent_id = "internal-container";
      }
      return { ...page, id, parent_id };
    }),
  };
  internalTree.pages.push({
    id: "internal-container",
    title: "Subpáginas internas del proyecto",
    parent_id: "internal-root",
  });
  writeJson("internal-tree.json", internalTree);
  const internalDiscover = run("discover", "internal-discovered", "--tree", "internal-tree.json");
  assert.equal(internalDiscover.status, 0, internalDiscover.stderr);
  assert.equal(parse(internalDiscover).hierarchy_mode, "internal-container");

  const treeWithSharedContract = {
    ...directTree,
    pages: [
      ...directTree.pages,
      {
        id: "shared-contract",
        title: "Contrato compartido — Example",
        parent_id: "discover-root",
      },
    ],
  };
  writeJson("tree-with-shared.json", treeWithSharedContract);
  const sharedPreview = run("discover", "shared-demo", "--tree", "tree-with-shared.json");
  assert.equal(sharedPreview.status, 0, sharedPreview.stderr);
  assert.equal(parse(sharedPreview).classification_complete, false);
  writeJson("shared-candidate.json", parse(sharedPreview).candidate_manifest);
  writeJson("shared-hierarchy.json", parse(sharedPreview).hierarchy_evidence);
  const blockedRegister = run(
    "register",
    "shared-demo",
    "--preview",
    "--manifest",
    "shared-candidate.json",
    "--hierarchy-evidence",
    "shared-hierarchy.json",
    "--registry",
    "shared-registry.json",
  );
  assert.notEqual(blockedRegister.status, 0);
  assert.match(parse(blockedRegister).errors.join("\n"), /unclassified discovery page/);

  const duplicatePackageTree = {
    ...directTree,
    pages: [
      ...directTree.pages,
      { id: "duplicate-package", title: "Paquete Markdown", parent_id: "discover-root" },
    ],
  };
  writeJson("duplicate-package-tree.json", duplicatePackageTree);
  const duplicatePackage = run("discover", "duplicate-demo", "--tree", "duplicate-package-tree.json");
  assert.notEqual(duplicatePackage.status, 0);
  assert.equal(parse(duplicatePackage).message, "multiple Paquete Markdown pages found");

  const flowManifest = {
    schema_version: 1,
    project: "flow-demo",
    package_kind: "project",
    notion_parent_page_id: "parent2",
    notion_root_page_id: "root2",
    notion_package_page_id: "package2",
    audit_log_page_id: "audit2",
    state_root: "artifacts/_local/notion-sync/flow-demo",
    checkout_root: "artifacts/_local/notion-checkouts/flow-demo",
    units: [
      {
        id: "00-workflow-state",
        role: "canonical",
        notion_page_id: "unit-00-flow",
        local_path: "00-workflow-state.md",
      },
      {
        id: "US-FLOW-01",
        role: "derived",
        notion_page_id: "unit-flow-01",
        local_path: "jira/US-FLOW-01.md",
      },
    ],
    presentations: [
      {
        id: "project-cover",
        role: "presentation",
        notion_page_id: "presentation-cover-flow",
        remote_path: "_presentation/project-cover.md",
        drift_policy: "review",
      },
    ],
  };
  const flowHierarchy = {
    notion_root_page_id: "root2",
    notion_root_parent_page_id: "parent2",
    notion_package_page_id: "package2",
    notion_package_parent_page_id: "root2",
    audit_log_page_id: "audit2",
    audit_log_parent_page_id: "root2",
  };
  writeJson("candidate2.json", flowManifest);
  writeJson("hierarchy2.json", flowHierarchy);
  const flowRegister = run(
    "register",
    "flow-demo",
    "--apply",
    "--manifest",
    "candidate2.json",
    "--hierarchy-evidence",
    "hierarchy2.json",
  );
  assert.equal(flowRegister.status, 0, flowRegister.stderr);

  writeText("remote-v1/00-workflow-state.md", "# Workflow State\n\nStatus: draft\n");
  writeText("remote-v1/jira/US-FLOW-01.md", "# US-FLOW-01\n\nAs a user...\n");
  writeText("remote-v1/_presentation/project-cover.md", "# Project Cover\n\nOverview text.\n");

  const start1 = run("start", "flow-demo", "--remote-dir", "remote-v1");
  assert.equal(start1.status, 0, start1.stderr);
  const startResult = parse(start1);
  assert.equal(startResult.operation, "start");
  assert.ok(startResult.snapshot);
  assert.equal(
    fs.existsSync(path.join(root, "artifacts/_local/notion-checkouts/flow-demo/00-workflow-state.md")),
    true,
  );
  assert.equal(
    fs.existsSync(path.join(root, "artifacts/_local/notion-checkouts/flow-demo/jira/US-FLOW-01.md")),
    true,
  );
  assert.equal(fs.existsSync(path.join(root, "artifacts/_local/notion-sync/flow-demo/base.json")), true);
  assert.equal(startResult.presentation_drift.length, 1);
  assert.equal(startResult.presentation_drift[0].state, "unbaselined");

  const status1 = run("status", "flow-demo", "--remote-dir", "remote-v1");
  assert.equal(status1.status, 0, status1.stderr);
  const status1Result = parse(status1);
  assert.equal(status1Result.ok, true);
  assert.ok(status1Result.rows.every((row) => row.state === "unchanged"));

  writeText(
    "artifacts/_local/notion-checkouts/flow-demo/00-workflow-state.md",
    "# Workflow State\n\nStatus: in-review\n",
  );

  const status2 = run("status", "flow-demo", "--remote-dir", "remote-v1");
  assert.equal(status2.status, 0, status2.stderr);
  const status2Result = parse(status2);
  const changedRow = status2Result.rows.find((row) => row.id === "00-workflow-state");
  assert.equal(changedRow.state, "local_changed");

  const publishBlocked = run("publish", "flow-demo", "--preview", "--remote-dir", "remote-v1");
  assert.equal(publishBlocked.status, 2);
  const publishBlockedResult = parse(publishBlocked);
  assert.equal(publishBlockedResult.ok, false);
  assert.equal(publishBlockedResult.blockers.length, 0);
  assert.equal(publishBlockedResult.presentation_blockers.length, 1);

  const baselinePreview = run("baseline", "flow-demo", "--preview", "--remote-dir", "remote-v1");
  assert.equal(baselinePreview.status, 0, baselinePreview.stderr);
  const baselinePreviewResult = parse(baselinePreview);
  assert.equal(baselinePreviewResult.candidates.length, 1);
  assert.equal(baselinePreviewResult.blockers.length, 0);

  const baselineMissingFlags = run("baseline", "flow-demo", "--apply", "--remote-dir", "remote-v1");
  assert.notEqual(baselineMissingFlags.status, 0);
  assert.equal(parse(baselineMissingFlags).message, "--ack-presentation-drift and --reason are required");

  const baselineApply = run(
    "baseline",
    "flow-demo",
    "--apply",
    "--remote-dir",
    "remote-v1",
    "--ack-presentation-drift",
    "--reason",
    "Editorial cover copy accepted as-is",
  );
  assert.equal(baselineApply.status, 0, baselineApply.stderr);
  const baselineApplyResult = parse(baselineApply);
  assert.equal(baselineApplyResult.updated.length, 1);
  assert.ok(baselineApplyResult.updated[0].base_sha256);

  const publishPreview = run("publish", "flow-demo", "--preview", "--remote-dir", "remote-v1");
  assert.equal(publishPreview.status, 0, publishPreview.stderr);
  const publishPreviewResult = parse(publishPreview);
  assert.equal(publishPreviewResult.ok, true);
  assert.equal(publishPreviewResult.write_set.length, 1);
  assert.equal(publishPreviewResult.write_set[0].id, "00-workflow-state");

  const publishNoAudit = run("publish", "flow-demo", "--apply", "--remote-dir", "remote-v1");
  assert.notEqual(publishNoAudit.status, 0);
  assert.equal(parse(publishNoAudit).message, "Audit identity is required");

  const publishApply = run(
    "publish",
    "flow-demo",
    "--apply",
    "--remote-dir",
    "remote-v1",
    "--change-author",
    "Juan Ramos",
    "--publishing-actor",
    "claude-code",
    "--authorized-by",
    "Juan Ramos",
    "--provider",
    "claude-code/test",
    "--reason",
    "Update workflow state status",
  );
  assert.equal(publishApply.status, 0, publishApply.stderr);
  const publishApplyResult = parse(publishApply);
  assert.equal(publishApplyResult.write_set.length, 1);
  const outboxDir = publishApplyResult.outbox;
  const backupDir = publishApplyResult.backup;
  assert.equal(fs.existsSync(path.join(outboxDir, "00-workflow-state.md")), true);
  assert.equal(fs.existsSync(path.join(outboxDir, "write-set.json")), true);
  assert.equal(fs.existsSync(path.join(backupDir, "00-workflow-state.md")), true);

  writeText("remote-v2/00-workflow-state.md", "# Workflow State\n\nStatus: in-review\n");
  writeText("remote-v2/jira/US-FLOW-01.md", "# US-FLOW-01\n\nAs a user...\n");
  writeText("remote-v2/_presentation/project-cover.md", "# Project Cover\n\nOverview text.\n");

  const publishVerify = run(
    "publish",
    "flow-demo",
    "--verify",
    "--outbox",
    outboxDir,
    "--remote-dir",
    "remote-v2",
  );
  assert.equal(publishVerify.status, 0, publishVerify.stderr);
  const publishVerifyResult = parse(publishVerify);
  assert.equal(publishVerifyResult.operation, "publish-verify");
  assert.ok(publishVerifyResult.snapshot);
  assert.ok(publishVerifyResult.audit_event);
  assert.equal(publishVerifyResult.audit_event.parent_page_id, "audit2");
  assert.equal(fs.existsSync(publishVerifyResult.export.zip), true);
  assert.equal(fs.existsSync(publishVerifyResult.export.manifest), true);
  assert.equal(fs.existsSync(publishVerifyResult.audit_event.event), true);
  assert.equal(fs.existsSync(publishVerifyResult.audit_event.markdown), true);

  const auditComplete = run(
    "audit",
    "flow-demo",
    "--complete",
    "--event",
    publishVerifyResult.audit_event.event,
    "--entry-page-id",
    "entry-page-123",
  );
  assert.equal(auditComplete.status, 0, auditComplete.stderr);
  const auditCompleteResult = parse(auditComplete);
  assert.equal(auditCompleteResult.operation, "audit-complete");
  assert.equal(fs.existsSync(auditCompleteResult.receipt), true);
  const receipt = JSON.parse(fs.readFileSync(auditCompleteResult.receipt, "utf8"));
  assert.equal(receipt.audit_status, "complete");
  assert.equal(receipt.entry_page_id, "entry-page-123");

  writeText(
    "artifacts/_local/notion-checkouts/flow-demo/jira/US-FLOW-01.md",
    "# US-FLOW-01\n\nAs a user, I can LOCAL EDIT...\n",
  );
  writeText("remote-v3/00-workflow-state.md", "# Workflow State\n\nStatus: in-review\n");
  writeText("remote-v3/jira/US-FLOW-01.md", "# US-FLOW-01\n\nAs a user, I can REMOTE EDIT...\n");
  writeText("remote-v3/_presentation/project-cover.md", "# Project Cover\n\nOverview text.\n");

  const reconcile = run("reconcile", "flow-demo", "--remote-dir", "remote-v3");
  assert.equal(reconcile.status, 2);
  const reconcileResult = parse(reconcile);
  assert.equal(reconcileResult.ok, false);
  const conflictRow = reconcileResult.rows.find((row) => row.id === "US-FLOW-01");
  assert.equal(conflictRow.state, "conflict");
  assert.equal(reconcileResult.conflicts.length, 1);

  const recoverPreview = run("recover", "flow-demo", "--preview", "--backup", backupDir);
  assert.equal(recoverPreview.status, 0, recoverPreview.stderr);
  const recoverPreviewResult = parse(recoverPreview);
  assert.deepEqual(recoverPreviewResult.units, ["00-workflow-state"]);

  const recoverApply = run(
    "recover",
    "flow-demo",
    "--apply",
    "--backup",
    backupDir,
    "--change-author",
    "Juan Ramos",
    "--publishing-actor",
    "claude-code",
    "--authorized-by",
    "Juan Ramos",
    "--provider",
    "claude-code/test",
    "--reason",
    "Roll back accidental status change",
  );
  assert.equal(recoverApply.status, 0, recoverApply.stderr);
  const recoverApplyResult = parse(recoverApply);
  assert.equal(recoverApplyResult.operation, "recover-apply");
  assert.deepEqual(recoverApplyResult.units, ["00-workflow-state"]);
  assert.equal(fs.existsSync(path.join(recoverApplyResult.outbox, "00-workflow-state.md")), true);
  assert.equal(fs.existsSync(path.join(recoverApplyResult.outbox, "write-set.json")), true);

  console.log(JSON.stringify({ ok: true, tests: 25, root }, null, 2));
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
