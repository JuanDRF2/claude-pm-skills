#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
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

  const normalize = (text) => `${text.replace(/\r\n?/g, "\n").replace(/\n*$/g, "")}\n`;
  const digest = (text) => crypto.createHash("sha256").update(normalize(text)).digest("hex");
  const demoState = path.join(root, manifest.state_root);
  const demoCheckout = path.join(root, manifest.checkout_root);
  const demoRemote = path.join(root, "remote-demo");
  const stableBody = "Stable content. ".repeat(100);
  const before = `# Demo\n\n${stableBody}\n`;
  const after = `# Demo\n\n${stableBody}\n\nApproved change.\n`;
  for (const [baseDir, workflow, story] of [
    [path.join(demoState, "base"), before, "# Story\n"],
    [demoRemote, before, "# Story\n"],
    [demoCheckout, after, "# Story\n"],
  ]) {
    fs.mkdirSync(path.join(baseDir, "jira"), { recursive: true });
    fs.writeFileSync(path.join(baseDir, "00-workflow-state.md"), workflow);
    fs.writeFileSync(path.join(baseDir, "jira/US-DEMO-01.md"), story);
  }
  writeJson(path.relative(root, path.join(demoState, "base.json")), {
    units: [
      { id: "00-workflow-state", sha256: digest(before) },
      { id: "US-DEMO-01", sha256: digest("# Story\n") },
    ],
  });
  const efficientPreview = run(
    "publish", "demo", "--preview", "--remote-dir", "remote-demo", "--ack-presentation-drift",
  );
  assert.equal(efficientPreview.status, 0, efficientPreview.stderr);
  const efficientPlan = parse(efficientPreview).write_set[0];
  assert.equal(efficientPlan.recommended_write_mode, "patch");
  assert.equal(efficientPlan.verification, "full-unit-readback-required");

  const auditEvent = writeJson(path.relative(root, path.join(demoState, "audit-outbox/event.json")), {
    event_id: "event",
  });
  fs.writeFileSync(auditEvent.replace(/\.json$/, ".md"), "{\"wrong\":true}\n");
  const badAudit = run("audit", "demo", "--complete", "--event", path.relative(root, auditEvent), "--entry-page-id", "entry");
  assert.notEqual(badAudit.status, 0);
  assert.equal(parse(badAudit).message, "Audit Markdown failed preflight");
  fs.writeFileSync(
    auditEvent.replace(/\.json$/, ".md"),
    "## Responsables\n\n## Operación\n\n## Páginas afectadas\n\n## Verificación\n",
  );
  const goodAudit = run("audit", "demo", "--complete", "--event", path.relative(root, auditEvent), "--entry-page-id", "entry");
  assert.equal(goodAudit.status, 0, goodAudit.stderr);

  const editorialEvent = writeJson(path.relative(root, path.join(demoState, "audit-outbox/editorial.json")), {
    event_id: "editorial",
    editorial_verification_required: true,
    expected_editorial_stories: ["US-DEMO-01"],
    editorial_scope_unresolved: false,
    final_snapshot: "a".repeat(64),
  });
  fs.writeFileSync(
    editorialEvent.replace(/\.json$/, ".md"),
    "## Responsables\n\n## Operación\n\n## Páginas afectadas\n\n## Verificación\n",
  );
  const missingEditorial = run("audit", "demo", "--complete", "--event", path.relative(root, editorialEvent), "--entry-page-id", "entry");
  assert.notEqual(missingEditorial.status, 0);
  assert.equal(parse(missingEditorial).message, "--editorial-receipt is required");
  writeJson("editorial-receipt.json", {
    project: "demo",
    ok: true,
    checked_at: "2026-08-04T00:00:00Z",
    stories: [{ story_id: "US-DEMO-01", ok: true }],
  });
  const missingJudge = run(
    "audit", "demo", "--complete", "--event", path.relative(root, editorialEvent),
    "--entry-page-id", "entry", "--editorial-receipt", "editorial-receipt.json",
  );
  assert.notEqual(missingJudge.status, 0);
  assert.equal(parse(missingJudge).message, "--judge-report is required after editorial verification");
  fs.writeFileSync(
    path.join(root, "post-publication-judge.md"),
    `# Refinement Judge\n\n- Veredicto: PASS\n- Acción evaluada: Paridad posterior a publicación en Notion\n- Snapshot revisado SHA-256: ${"a".repeat(64)}\n`,
  );
  fs.writeFileSync(
    path.join(root, "failed-judge.md"),
    `# Refinement Judge\n\n- Veredicto: FAIL\n- Acción evaluada: Publicación en Notion\n- Snapshot revisado SHA-256: ${"a".repeat(64)}\n- Excepción humana: Ninguna\n`,
  );
  const blockedJudge = run(
    "audit", "demo", "--complete", "--event", path.relative(root, editorialEvent),
    "--entry-page-id", "entry", "--editorial-receipt", "editorial-receipt.json",
    "--judge-report", "failed-judge.md",
  );
  assert.notEqual(blockedJudge.status, 0);
  assert.equal(parse(blockedJudge).message, "Post-publication Judge did not authorize Notion editorial completion");
  const completeEditorial = run(
    "audit", "demo", "--complete", "--event", path.relative(root, editorialEvent),
    "--entry-page-id", "entry", "--editorial-receipt", "editorial-receipt.json",
    "--judge-report", "post-publication-judge.md",
  );
  assert.equal(completeEditorial.status, 0, completeEditorial.stderr);
  const editorialReceipt = JSON.parse(fs.readFileSync(path.join(demoState, "receipts/editorial.json"), "utf8"));
  assert.equal(editorialReceipt.editorial_verification.stories_verified[0], "US-DEMO-01");

  assert.equal(editorialReceipt.post_publication_judge.verdict, "PASS");

  console.log(JSON.stringify({ ok: true, tests: 22, root }, null, 2));
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
