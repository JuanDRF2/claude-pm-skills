#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const cli = path.resolve(
  process.argv[2] || fileURLToPath(new URL("./refinement-sync.mjs", import.meta.url)),
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
    checkout_root: "artifacts/demo",
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

  const githubManifest = {
    ...manifest,
    project: "github-demo",
    state_root: "artifacts/_local/notion-sync/github-demo",
    checkout_root: "artifacts/github-demo",
    source_model: "github-main-v1",
    source_repository: "https://github.com/<your-org>/<your-repo>",
    source_branch: "main",
    source_commit: "a".repeat(40),
  };
  writeJson("github-candidate.json", githubManifest);
  const githubApply = run(
    "register",
    "github-demo",
    "--apply",
    "--manifest",
    "github-candidate.json",
    "--hierarchy-evidence",
    "hierarchy.json",
    "--registry",
    "github-registry.json",
  );
  assert.equal(githubApply.status, 0, githubApply.stderr);
  const githubRegistry = JSON.parse(
    fs.readFileSync(path.join(root, "github-registry.json"), "utf8"),
  );
  assert.equal(githubRegistry.projects["github-demo"].source_model, "github-main-v1");
  assert.equal(githubRegistry.projects["github-demo"].source_branch, "main");
  assert.equal(githubRegistry.projects["github-demo"].source_commit, "a".repeat(40));

  const incompleteGithubManifest = { ...githubManifest };
  delete incompleteGithubManifest.source_commit;
  writeJson("incomplete-github-candidate.json", incompleteGithubManifest);
  const incompleteGithub = run(
    "register",
    "github-demo",
    "--preview",
    "--manifest",
    "incomplete-github-candidate.json",
    "--hierarchy-evidence",
    "hierarchy.json",
    "--registry",
    "incomplete-github-registry.json",
  );
  assert.notEqual(incompleteGithub.status, 0);
  assert.equal(parse(incompleteGithub).message, "Registration validation failed");

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
    checkout_root: "artifacts/demo-container",
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
  const discoverPreview = run(
    "discover",
    "discovered",
    "--tree",
    "direct-tree.json",
    "--source-repository",
    "https://github.com/<your-org>/<your-repo>",
    "--source-branch",
    "main",
    "--source-commit",
    "b".repeat(40),
  );
  assert.equal(discoverPreview.status, 0, discoverPreview.stderr);
  const discovered = parse(discoverPreview);
  assert.equal(discovered.operation, "discover-preview");
  assert.equal(discovered.hierarchy_mode, "direct-root");
  assert.equal(discovered.classification_complete, true);
  assert.equal(discovered.candidate_manifest.checkout_root, "artifacts/discovered");
  assert.equal(discovered.candidate_manifest.source_model, "github-main-v1");
  assert.equal(discovered.candidate_manifest.source_branch, "main");
  assert.equal(discovered.candidate_manifest.source_commit, "b".repeat(40));
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

  const legacyManifest = {
    ...manifest,
    project: "legacy-demo",
    state_root: "artifacts/_local/notion-sync/legacy-demo",
    checkout_root: "artifacts/_local/notion-checkouts/legacy-demo",
    units: [manifest.units[0]],
    presentations: [],
  };
  writeJson("legacy-manifest.json", legacyManifest);
  writeJson("legacy-registry.json", {
    schema_version: 1,
    projects: {
      "legacy-demo": {
        manifest_file: "legacy-manifest.json",
        state_root: legacyManifest.state_root,
        checkout_root: legacyManifest.checkout_root,
      },
    },
  });
  const legacyBase = path.join(root, legacyManifest.state_root, "base");
  const legacyCheckout = path.join(root, legacyManifest.checkout_root);
  const canonicalCheckout = path.join(root, "artifacts/legacy-package");
  for (const folder of [legacyBase, legacyCheckout, canonicalCheckout]) {
    fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(path.join(folder, "00-workflow-state.md"), "# Legacy\n");
  }
  writeJson(path.relative(root, path.join(root, legacyManifest.state_root, "base.json")), {
    units: [{ id: "00-workflow-state", sha256: crypto.createHash("sha256").update("# Legacy\n").digest("hex") }],
  });
  const legacyStatus = run(
    "status", "legacy-demo", "--remote-dir", "artifacts/legacy-demo",
    "--registry", "legacy-registry.json",
  );
  assert.notEqual(legacyStatus.status, 0);
  assert.equal(parse(legacyStatus).message, "Registered checkout_root is not the canonical project package");
  const migrationPreview = run(
    "migrate-checkout-root", "legacy-demo", "--preview",
    "--target", "artifacts/legacy-package",
    "--registry", "legacy-registry.json",
  );
  assert.equal(migrationPreview.status, 0, migrationPreview.stderr);
  assert.equal(parse(migrationPreview).canonical_checkout_root, "artifacts/legacy-package");
  fs.unlinkSync(path.join(legacyCheckout, "00-workflow-state.md"));
  const alignedTargetOnly = run(
    "migrate-checkout-root", "legacy-demo", "--preview",
    "--target", "artifacts/legacy-package",
    "--registry", "legacy-registry.json",
  );
  assert.equal(alignedTargetOnly.status, 0, alignedTargetOnly.stderr);
  assert.equal(parse(alignedTargetOnly).rows[0].state, "target_only");
  const verifiedSource = "# Canonical source\n";
  writeJson(path.relative(root, path.join(root, legacyManifest.state_root, "base.json")), {
    units: [{
      id: "00-workflow-state",
      source_sha256: crypto.createHash("sha256").update(verifiedSource).digest("hex"),
      sha256: crypto.createHash("sha256").update("# Legacy\n").digest("hex"),
    }],
  });
  fs.writeFileSync(path.join(canonicalCheckout, "00-workflow-state.md"), verifiedSource);
  const verifiedSourceTargetOnly = run(
    "migrate-checkout-root", "legacy-demo", "--preview",
    "--target", "artifacts/legacy-package",
    "--registry", "legacy-registry.json",
  );
  assert.equal(verifiedSourceTargetOnly.status, 0, verifiedSourceTargetOnly.stderr);
  assert.equal(parse(verifiedSourceTargetOnly).rows[0].state, "target_only");
  fs.writeFileSync(path.join(canonicalCheckout, "00-workflow-state.md"), "# Target changed\n");
  const changedTargetOnly = run(
    "migrate-checkout-root", "legacy-demo", "--preview",
    "--target", "artifacts/legacy-package",
    "--registry", "legacy-registry.json",
  );
  assert.notEqual(changedTargetOnly.status, 0);
  assert.equal(parse(changedTargetOnly).blockers[0].state, "target_only_changed");
  writeJson(path.relative(root, path.join(root, legacyManifest.state_root, "base.json")), {
    units: [],
  });
  fs.writeFileSync(path.join(canonicalCheckout, "00-workflow-state.md"), "# Legacy\n");
  const unverifiedTargetOnly = run(
    "migrate-checkout-root", "legacy-demo", "--preview",
    "--target", "artifacts/legacy-package",
    "--registry", "legacy-registry.json",
  );
  assert.notEqual(unverifiedTargetOnly.status, 0);
  assert.equal(parse(unverifiedTargetOnly).blockers[0].state, "target_only_unverified");
  writeJson(path.relative(root, path.join(root, legacyManifest.state_root, "base.json")), {
    units: [{ id: "00-workflow-state", sha256: crypto.createHash("sha256").update("# Legacy\n").digest("hex") }],
  });
  fs.writeFileSync(path.join(legacyCheckout, "00-workflow-state.md"), "# Legacy changed\n");
  fs.writeFileSync(path.join(canonicalCheckout, "00-workflow-state.md"), "# Target changed\n");
  const blockedMigration = run(
    "migrate-checkout-root", "legacy-demo", "--preview",
    "--target", "artifacts/legacy-package",
    "--registry", "legacy-registry.json",
  );
  assert.notEqual(blockedMigration.status, 0);
  assert.equal(parse(blockedMigration).blockers[0].state, "diverged");
  fs.writeFileSync(path.join(legacyCheckout, "00-workflow-state.md"), "# Legacy\n");
  fs.writeFileSync(path.join(canonicalCheckout, "00-workflow-state.md"), "# Legacy\n");
  const migrationApply = run(
    "migrate-checkout-root", "legacy-demo", "--apply", "--ack-canonical-root",
    "--target", "artifacts/legacy-package", "--reason", "Unify local canonical package",
    "--registry", "legacy-registry.json",
  );
  assert.equal(migrationApply.status, 0, migrationApply.stderr);
  assert.equal(
    JSON.parse(fs.readFileSync(path.join(root, "legacy-registry.json"), "utf8")).projects["legacy-demo"].checkout_root,
    "artifacts/legacy-package",
  );
  assert.equal(
    JSON.parse(fs.readFileSync(path.join(root, "legacy-manifest.json"), "utf8")).checkout_root,
    "artifacts/legacy-package",
  );
  fs.mkdirSync(path.join(root, "legacy-remote"), { recursive: true });
  fs.writeFileSync(path.join(root, "legacy-remote", "00-workflow-state.md"), "# Remote update\n");
  const singleRepresentationStart = run(
    "start", "legacy-demo", "--remote-dir", "legacy-remote",
    "--registry", "legacy-registry.json",
  );
  assert.equal(singleRepresentationStart.status, 0, singleRepresentationStart.stderr);
  assert.equal(
    fs.readFileSync(path.join(canonicalCheckout, "00-workflow-state.md"), "utf8"),
    "# Remote update\n",
  );

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
    "--all-local-changes",
  );
  assert.equal(efficientPreview.status, 0, efficientPreview.stderr);
  const efficientPlan = parse(efficientPreview).write_set[0];
  assert.equal(efficientPlan.recommended_write_mode, "patch");
  assert.equal(efficientPlan.verification, "full-unit-readback-required");

  const dualSource = "# Dual source\n\nBody\n\n- A\n";
  const dualTransportBase = "Body\n\n- A\n";
  const dualTransportFresh = "Body\n- A\n";
  const dualPreserved = "# Preserved\n";
  const dualManifest = {
    schema_version: 1,
    project: "dual-demo",
    package_kind: "project",
    checkout_root: "artifacts/dual-demo",
    state_root: "artifacts/_local/notion-sync/dual-demo",
    units: [
      {
        id: "dual",
        role: "canonical",
        local_path: "dual.md",
        notion_page_id: "dual-page",
        source_sha256: digest(dualSource),
        sha256: digest(dualTransportBase),
      },
      {
        id: "dual-preserved",
        role: "canonical",
        local_path: "dual-preserved.md",
        notion_page_id: "dual-preserved-page",
        source_sha256: digest(dualPreserved),
        sha256: digest(dualPreserved),
      },
    ],
    presentations: [
      {
        id: "dual-presentation",
        role: "presentation",
        remote_path: "_presentation/dual.md",
        notion_page_id: "dual-presentation-page",
        base_sha256: digest("Old presentation\n"),
      },
      {
        id: "dual-presentation-blocked",
        role: "presentation",
        remote_path: "_presentation/dual-blocked.md",
        notion_page_id: "dual-presentation-blocked-page",
        base_sha256: digest("Old blocked presentation\n"),
      },
    ],
  };
  writeJson("dual-manifest.json", dualManifest);
  writeJson("dual-registry.json", {
    schema_version: 1,
    projects: {
      "dual-demo": {
        manifest_file: "dual-manifest.json",
        checkout_root: dualManifest.checkout_root,
        state_root: dualManifest.state_root,
      },
    },
  });
  fs.mkdirSync(path.join(root, dualManifest.checkout_root), { recursive: true });
  fs.mkdirSync(path.join(root, dualManifest.state_root, "base"), { recursive: true });
  fs.mkdirSync(path.join(root, "dual-remote"), { recursive: true });
  fs.mkdirSync(path.join(root, "dual-remote", "_presentation"), { recursive: true });
  fs.writeFileSync(path.join(root, dualManifest.checkout_root, "dual.md"), dualSource);
  fs.writeFileSync(path.join(root, dualManifest.checkout_root, "dual-preserved.md"), dualPreserved);
  fs.writeFileSync(path.join(root, dualManifest.state_root, "base", "dual.md"), dualTransportBase);
  fs.writeFileSync(path.join(root, dualManifest.state_root, "base", "dual-preserved.md"), dualPreserved);
  fs.writeFileSync(path.join(root, "dual-remote", "dual.md"), dualTransportFresh);
  fs.writeFileSync(path.join(root, "dual-remote", "_presentation/dual.md"), "New presentation\n");
  fs.writeFileSync(
    path.join(root, "dual-remote", "_presentation/dual-blocked.md"),
    "Real editorial difference\n",
  );
  fs.writeFileSync(path.join(root, "dual-remote", "dual-preserved.md"), dualPreserved);
  writeJson(path.join(dualManifest.state_root, "base.json"), {
    schema_version: 1,
    project: "dual-demo",
    units: [
      {
        id: "dual",
        source_sha256: digest(dualSource),
        sha256: digest(dualTransportBase),
      },
      {
        id: "dual-preserved",
        source_sha256: digest(dualPreserved),
        sha256: digest(dualPreserved),
      },
    ],
  });
  const dualStatus = run(
    "status", "dual-demo", "--remote-dir", "dual-remote", "--registry", "dual-registry.json",
  );
  assert.equal(dualStatus.status, 0, dualStatus.stderr);
  assert.equal(parse(dualStatus).rows[0].state, "remote_changed");
  const dualStartBlocked = run(
    "start", "dual-demo", "--remote-dir", "dual-remote", "--registry", "dual-registry.json",
  );
  assert.notEqual(dualStartBlocked.status, 0);
  assert.equal(
    parse(dualStartBlocked).message,
    "Start requires source reconciliation for dual representations",
  );
  const dualBaselinePreview = run(
    "baseline", "dual-demo", "--preview", "--remote-dir", "dual-remote",
    "--registry", "dual-registry.json", "--transport-only",
  );
  assert.equal(dualBaselinePreview.status, 0, dualBaselinePreview.stderr);
  assert.deepEqual(parse(dualBaselinePreview).transport_candidates.map((item) => item.id), ["dual"]);
  const dualBaselineBlocked = run(
    "baseline", "dual-demo", "--apply", "--remote-dir", "dual-remote",
    "--registry", "dual-registry.json", "--reason", "Connector reserialization",
    "--transport-only",
  );
  assert.notEqual(dualBaselineBlocked.status, 0);
  assert.equal(parse(dualBaselineBlocked).message, "--ack-transport-drift is required");
  const dualBaselineApply = run(
    "baseline", "dual-demo", "--apply", "--remote-dir", "dual-remote",
    "--registry", "dual-registry.json", "--reason", "Connector reserialization",
    "--ack-transport-drift", "--transport-only",
  );
  assert.equal(dualBaselineApply.status, 0, dualBaselineApply.stderr);
  assert.equal(parse(dualBaselineApply).scope, "transport");
  assert.deepEqual(parse(dualBaselineApply).updated_presentations, []);
  assert.equal(
    fs.readFileSync(path.join(root, dualManifest.checkout_root, "dual.md"), "utf8"),
    dualSource,
  );
  const presentationWithoutPlan = run(
    "baseline", "dual-demo", "--preview", "--remote-dir", "dual-remote",
    "--registry", "dual-registry.json", "--presentation-only",
  );
  assert.notEqual(presentationWithoutPlan.status, 0);
  assert.equal(parse(presentationWithoutPlan).message, "Presentation baseline plan is required");
  const manifestAfterTransport = JSON.parse(
    fs.readFileSync(path.join(root, "dual-manifest.json"), "utf8"),
  );
  writeJson("dual-presentation-plan.json", {
    schema_version: 1,
    project: "dual-demo",
    base_snapshot: manifestAfterTransport.snapshot,
    presentations: [
      {
        id: "dual-presentation",
        classification: "equivalent",
        reason: "Verified editorial equivalence",
        base_sha256: digest("Old presentation\n"),
        remote_sha256: digest("New presentation\n"),
      },
    ],
    excluded_presentations: [
      {
        id: "dual-presentation-blocked",
        classification: "real_difference",
        reason: "Must remain visible for correction",
        base_sha256: digest("Old blocked presentation\n"),
        remote_sha256: digest("Real editorial difference\n"),
      },
    ],
  });
  const selectivePresentationPreview = run(
    "baseline", "dual-demo", "--preview", "--remote-dir", "dual-remote",
    "--registry", "dual-registry.json", "--presentation-only",
    "--presentation-plan", "dual-presentation-plan.json",
  );
  assert.equal(selectivePresentationPreview.status, 0, selectivePresentationPreview.stderr);
  assert.deepEqual(
    parse(selectivePresentationPreview).selected_presentations.map((item) => item.id),
    ["dual-presentation"],
  );
  assert.deepEqual(
    parse(selectivePresentationPreview).excluded_presentations.map((item) => item.id),
    ["dual-presentation-blocked"],
  );
  const selectivePresentationApply = run(
    "baseline", "dual-demo", "--apply", "--remote-dir", "dual-remote",
    "--registry", "dual-registry.json", "--presentation-only",
    "--presentation-plan", "dual-presentation-plan.json", "--ack-presentation-drift",
    "--reason", "Accept only verified equivalent presentation",
  );
  assert.equal(selectivePresentationApply.status, 0, selectivePresentationApply.stderr);
  assert.deepEqual(
    parse(selectivePresentationApply).updated_presentations.map((item) => item.id),
    ["dual-presentation"],
  );
  assert.deepEqual(
    parse(selectivePresentationApply).excluded_presentations.map((item) => item.id),
    ["dual-presentation-blocked"],
  );
  const manifestAfterPresentation = JSON.parse(
    fs.readFileSync(path.join(root, "dual-manifest.json"), "utf8"),
  );
  assert.equal(
    manifestAfterPresentation.presentations.find((item) => item.id === "dual-presentation").base_sha256,
    digest("New presentation\n"),
  );
  assert.equal(
    manifestAfterPresentation.presentations.find((item) => item.id === "dual-presentation-blocked").base_sha256,
    digest("Old blocked presentation\n"),
  );
  const dualStart = run(
    "start", "dual-demo", "--remote-dir", "dual-remote", "--registry", "dual-registry.json",
  );
  assert.equal(dualStart.status, 0, dualStart.stderr);
  assert.equal(
    fs.readFileSync(path.join(root, dualManifest.checkout_root, "dual.md"), "utf8"),
    dualSource,
  );
  const dualEditedSource = `${dualSource}\nApproved local change.\n\n| A | B |\n| --- | ---: |\n| [Matrix link](https://example.test/matrix) | Value |\n`;
  const dualHistoricalPreserved = "# Preserved historical local difference\n";
  fs.writeFileSync(path.join(root, dualManifest.checkout_root, "dual.md"), dualEditedSource);
  fs.writeFileSync(
    path.join(root, dualManifest.checkout_root, "dual-preserved.md"),
    dualHistoricalPreserved,
  );
  const dualScopeStatus = parse(run(
    "status", "dual-demo", "--remote-dir", "dual-remote", "--registry", "dual-registry.json",
  ));
  const dualChanged = dualScopeStatus.rows.filter((item) => item.state === "local_changed");
  const dualChangedById = new Map(dualChanged.map((item) => [item.id, item]));
  const noWritePlan = run(
    "publish", "dual-demo", "--preview", "--remote-dir", "dual-remote",
    "--registry", "dual-registry.json", "--ack-presentation-drift",
  );
  assert.notEqual(noWritePlan.status, 0);
  assert.equal(parse(noWritePlan).message, "Publish scope approval is required");
  writeJson("dual-incomplete-write-plan.json", {
    schema_version: 1,
    project: "dual-demo",
    base_snapshot: manifestAfterPresentation.snapshot,
    units: [
      {
        id: "dual",
        classification: "approved_scope",
        reason: "Approved product change",
        local_sha256: dualChangedById.get("dual").local_sha256,
        remote_sha256: dualChangedById.get("dual").remote_sha256,
      },
    ],
    excluded_units: [],
  });
  const incompleteWritePlan = run(
    "publish", "dual-demo", "--preview", "--remote-dir", "dual-remote",
    "--registry", "dual-registry.json", "--ack-presentation-drift",
    "--write-plan", "dual-incomplete-write-plan.json",
  );
  assert.notEqual(incompleteWritePlan.status, 0);
  assert.equal(parse(incompleteWritePlan).message, "Write plan validation failed");
  writeJson("dual-write-plan.json", {
    schema_version: 1,
    project: "dual-demo",
    base_snapshot: manifestAfterPresentation.snapshot,
    units: [
      {
        id: "dual",
        classification: "approved_scope",
        reason: "Approved product change",
        local_sha256: dualChangedById.get("dual").local_sha256,
        remote_sha256: dualChangedById.get("dual").remote_sha256,
      },
    ],
    excluded_units: [
      {
        id: "dual-preserved",
        classification: "historical_out_of_scope",
        reason: "Historical local difference must not expand the publication",
        local_sha256: dualChangedById.get("dual-preserved").local_sha256,
        remote_sha256: dualChangedById.get("dual-preserved").remote_sha256,
      },
    ],
  });
  const dualPublishPreview = run(
    "publish", "dual-demo", "--preview", "--remote-dir", "dual-remote",
    "--registry", "dual-registry.json", "--ack-presentation-drift",
    "--write-plan", "dual-write-plan.json",
  );
  assert.equal(dualPublishPreview.status, 0, dualPublishPreview.stderr);
  assert.deepEqual(parse(dualPublishPreview).write_set.map((item) => item.id), ["dual"]);
  assert.deepEqual(
    parse(dualPublishPreview).excluded_local_changes.map((item) => item.id),
    ["dual-preserved"],
  );
  const dualPublishApply = run(
    "publish", "dual-demo", "--apply", "--remote-dir", "dual-remote",
    "--registry", "dual-registry.json", "--ack-presentation-drift",
    "--write-plan", "dual-write-plan.json",
  );
  assert.equal(dualPublishApply.status, 0, dualPublishApply.stderr);
  const dualOutbox = parse(dualPublishApply).outbox;
  assert.equal(fs.existsSync(path.join(dualOutbox, "dual.md")), true, dualOutbox);
  fs.mkdirSync(path.join(root, "dual-readback"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "dual-readback", "dual.md"),
    "Body\n- A\n\nApproved local change.\n\n| A | B |\n|---|---|\n| [Matrix](https://example.test/matrix)[ link](https://example.test/matrix) | Value |\n",
  );
  fs.writeFileSync(path.join(root, "dual-readback", "dual-preserved.md"), dualPreserved);
  const outboxUnit = path.join(dualOutbox, "dual.md");
  const hiddenOutboxUnit = `${outboxUnit}.hidden`;
  fs.renameSync(outboxUnit, hiddenOutboxUnit);
  const missingOutboxVerify = run(
    "publish", "dual-demo", "--verify", "--outbox", dualOutbox,
    "--remote-dir", "dual-readback", "--registry", "dual-registry.json",
  );
  assert.notEqual(missingOutboxVerify.status, 0);
  assert.equal(parse(missingOutboxVerify).message, "Readback mismatch");
  assert.equal(parse(missingOutboxVerify).verification[0].mode, "missing-outbox-unit");
  fs.renameSync(hiddenOutboxUnit, outboxUnit);
  fs.writeFileSync(
    path.join(root, "dual-readback", "dual.md"),
    "Body\n- A\n\nDifferent product decision.\n",
  );
  const semanticMismatchVerify = run(
    "publish", "dual-demo", "--verify", "--outbox", dualOutbox,
    "--remote-dir", "dual-readback", "--registry", "dual-registry.json",
  );
  assert.notEqual(semanticMismatchVerify.status, 0);
  assert.equal(parse(semanticMismatchVerify).verification[0].mode, "mismatch");
  fs.writeFileSync(
    path.join(root, "dual-readback", "dual.md"),
    "Body\n- A\n\nApproved local change.\n\n| A | B |\n|---|---|\n| [Matrix](https://example.test/matrix)[ link](https://example.test/matrix) | Value |\n",
  );
  fs.writeFileSync(path.join(root, "dual-readback", "dual-preserved.md"), "# Concurrent edit\n");
  const changedPreservedVerify = run(
    "publish", "dual-demo", "--verify", "--outbox", dualOutbox,
    "--remote-dir", "dual-readback", "--registry", "dual-registry.json",
  );
  assert.notEqual(changedPreservedVerify.status, 0);
  assert.equal(
    parse(changedPreservedVerify).verification.find((item) => item.id === "dual-preserved").mode,
    "unexpected-preserved-change",
  );
  fs.writeFileSync(path.join(root, "dual-readback", "dual-preserved.md"), dualPreserved);
  const dualVerify = run(
    "publish", "dual-demo", "--verify", "--outbox", dualOutbox,
    "--remote-dir", "dual-readback", "--registry", "dual-registry.json",
  );
  assert.equal(dualVerify.status, 0, dualVerify.stderr);
  assert.deepEqual(parse(dualVerify).readback_verification, [
    { id: "dual", mode: "markdown-semantic", equivalence_mode: null, unexpected_functional_change: false },
    { id: "dual-preserved", mode: "preserved", equivalence_mode: null, unexpected_functional_change: false },
  ], dualVerify.stdout);
  assert.equal(
    fs.readFileSync(path.join(root, dualManifest.checkout_root, "dual.md"), "utf8"),
    dualEditedSource,
  );
  const dualVerifiedManifest = JSON.parse(fs.readFileSync(path.join(root, "dual-manifest.json"), "utf8"));
  assert.equal(dualVerifiedManifest.units[0].source_sha256, digest(dualEditedSource));
  assert.equal(dualVerifiedManifest.units[1].source_sha256, digest(dualPreserved));
  const postVerifyStatus = parse(run(
    "status", "dual-demo", "--remote-dir", "dual-readback", "--registry", "dual-registry.json",
  ));
  assert.equal(
    postVerifyStatus.rows.find((item) => item.id === "dual-preserved").state,
    "local_changed",
  );

  const largeUnits = Array.from({ length: 300 }, (_, index) => {
    const id = `large-${String(index).padStart(3, "0")}`;
    return {
      id,
      role: "canonical",
      local_path: `${id}.md`,
      notion_page_id: `${id}-page`,
      source_sha256: digest(`# ${id}\n`),
      sha256: digest(`# ${id}\n`),
    };
  });
  const largeManifest = {
    schema_version: 1,
    project: "large-demo",
    package_kind: "project",
    checkout_root: "artifacts/large-demo",
    state_root: "artifacts/_local/notion-sync/large-demo",
    units: largeUnits,
    presentations: [],
  };
  writeJson("large-manifest.json", largeManifest);
  writeJson("large-registry.json", {
    schema_version: 1,
    projects: {
      "large-demo": {
        manifest_file: "large-manifest.json",
        checkout_root: largeManifest.checkout_root,
        state_root: largeManifest.state_root,
      },
    },
  });
  writeJson(path.join(largeManifest.state_root, "base.json"), { units: largeUnits });
  for (const unit of largeUnits) {
    for (const directory of [largeManifest.checkout_root, "large-remote"]) {
      const file = path.join(root, directory, unit.local_path);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, `# ${unit.id}\n`);
    }
  }
  const largeStatus = run(
    "status", "large-demo", "--remote-dir", "large-remote", "--registry", "large-registry.json",
  );
  assert.equal(largeStatus.status, 0, largeStatus.stderr);
  assert.equal(parse(largeStatus).rows.length, 300);

  const auditMarkdownBody = "## Responsables\n\n## Operación\n\n## Páginas afectadas\n\n## Verificación\n";
  const auditEventRelative = path.relative(root, path.join(demoState, "audit-outbox/event.json"));
  const auditEvent = writeJson(auditEventRelative, {
    schema_version: 2,
    event_id: "event",
    project: "demo",
    final_snapshot: "a".repeat(64),
    editorial_verification_required: false,
    audit_entry: {
      parent_page_id: "audit",
      title: "2026-08-04 · publish verificada",
      payload_path: auditEventRelative.replace(/\.json$/, ".md"),
    },
  });
  fs.writeFileSync(auditEvent.replace(/\.json$/, ".md"), "{\"wrong\":true}\n");
  const badAudit = run("audit", "demo", "--complete", "--event", path.relative(root, auditEvent), "--entry-receipt", "entry-receipt.json");
  assert.notEqual(badAudit.status, 0);
  assert.equal(parse(badAudit).message, "Audit Markdown failed preflight");
  fs.writeFileSync(auditEvent.replace(/\.json$/, ".md"), auditMarkdownBody);
  fs.writeFileSync(path.join(root, "audit-readback.md"), auditMarkdownBody);
  writeJson("entry-receipt.json", {
    parent_page_id: "audit",
    title: "2026-08-04 · publish verificada",
    payload_sha256: digest(auditMarkdownBody),
    entry_page_id: "entry",
    readback_path: "audit-readback.md",
    readback_sha256: digest(auditMarkdownBody),
    duplicate_count: 0,
    checked_at: "2026-08-04T00:00:00Z",
  });
  writeJson("presentation-receipt.json", {
    project: "demo", ok: true, final_snapshot: "a".repeat(64), checked_at: "2026-08-04T00:00:00Z",
    presentations_expected: 0, presentations_verified: 0, by_type: {}, presentations: [],
  });
  writeJson("publication-run-receipt.json", {
    schema_version: 2,
    operation: "notion-publication-run-receipt",
    status: "verified",
    dossier_sha256: "c".repeat(64),
    authorization_digest: "c".repeat(64),
    final_snapshots: { demo: "a".repeat(64) },
    started_at: "2026-08-04T00:00:00Z",
    completed_at: "2026-08-04T00:01:00Z",
    duration_ms: 60000,
    freshness_pages_expected: 3,
    pages_total: 2,
    pages_verified: 2,
    projects: { demo: { total: 2, verified: 2, pending: 0, failed: 0, blocked: 0 } },
    metrics: { metadata_checks: 1, metadata_pages_checked: 3, content_reads: 2, writes: 2, retries: 0 },
    operation_budget: { metadata_checks: 1, metadata_pages_checked: 3, content_reads: 2, writes: 2, retries: 2 },
    pages: [],
  });
  fs.writeFileSync(
    path.join(root, "post-publication-judge.md"),
    `# Refinement Judge\n\n- Veredicto: PASS\n- Acción evaluada: Paridad posterior a publicación en Notion\n- Etapa de acción: Post-publication\n- Alcance de acción: technical=1; editorial=0\n- Snapshot revisado SHA-256: ${"a".repeat(64)}\n`,
  );
  const commonAuditArgs = [
    "--entry-receipt", "entry-receipt.json",
    "--presentation-receipt", "presentation-receipt.json",
    "--judge-report", "post-publication-judge.md",
    "--publication-run-receipt", "publication-run-receipt.json",
  ];
  const goodAudit = run("audit", "demo", "--complete", "--event", path.relative(root, auditEvent), ...commonAuditArgs);
  assert.equal(goodAudit.status, 0, goodAudit.stderr);

  const editorialEventRelative = path.relative(root, path.join(demoState, "audit-outbox/editorial.json"));
  const editorialEvent = writeJson(editorialEventRelative, {
    schema_version: 2,
    event_id: "editorial",
    project: "demo",
    editorial_verification_required: true,
    expected_editorial_stories: ["US-DEMO-01"],
    editorial_scope_unresolved: false,
    final_snapshot: "a".repeat(64),
    audit_entry: {
      parent_page_id: "audit",
      title: "2026-08-04 · publish verificada",
      payload_path: editorialEventRelative.replace(/\.json$/, ".md"),
    },
  });
  fs.writeFileSync(editorialEvent.replace(/\.json$/, ".md"), auditMarkdownBody);
  const missingEditorial = run("audit", "demo", "--complete", "--event", path.relative(root, editorialEvent), ...commonAuditArgs);
  assert.notEqual(missingEditorial.status, 0);
  assert.equal(parse(missingEditorial).message, "--editorial-receipt is required");
  writeJson("editorial-receipt.json", {
    project: "demo",
    ok: true,
    checked_at: "2026-08-04T00:00:00Z",
    stories: [{ story_id: "US-DEMO-01", ok: true }],
  });
  fs.writeFileSync(
    path.join(root, "failed-judge.md"),
    `# Refinement Judge\n\n- Veredicto: FAIL\n- Acción evaluada: Publicación en Notion\n- Etapa de acción: Post-publication\n- Alcance de acción: technical=1; editorial=1\n- Snapshot revisado SHA-256: ${"a".repeat(64)}\n- Excepción humana: Ninguna\n`,
  );
  const blockedJudge = run(
    "audit", "demo", "--complete", "--event", path.relative(root, editorialEvent),
    "--entry-receipt", "entry-receipt.json", "--presentation-receipt", "presentation-receipt.json",
    "--editorial-receipt", "editorial-receipt.json", "--judge-report", "failed-judge.md",
    "--publication-run-receipt", "publication-run-receipt.json",
  );
  assert.notEqual(blockedJudge.status, 0);
  assert.equal(parse(blockedJudge).message, "Post-publication Judge did not authorize audit completion");
  const completeEditorial = run(
    "audit", "demo", "--complete", "--event", path.relative(root, editorialEvent),
    "--entry-receipt", "entry-receipt.json", "--presentation-receipt", "presentation-receipt.json",
    "--editorial-receipt", "editorial-receipt.json", "--judge-report", "post-publication-judge.md",
    "--publication-run-receipt", "publication-run-receipt.json",
  );
  assert.equal(completeEditorial.status, 0, completeEditorial.stderr);
  const editorialReceipt = JSON.parse(fs.readFileSync(path.join(demoState, "receipts/editorial.json"), "utf8"));
  assert.equal(editorialReceipt.editorial_verification.stories_verified[0], "US-DEMO-01");

  assert.equal(editorialReceipt.post_publication_judge.verdict, "PASS");

  assert.equal(editorialReceipt.schema_version, 3);
  assert.equal(editorialReceipt.audit_entry_receipt.duplicate_count, 0);
  assert.equal(editorialReceipt.publication_run.metrics.metadata_checks, 1);

  console.log(JSON.stringify({ ok: true, tests: 49, root }, null, 2));
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
