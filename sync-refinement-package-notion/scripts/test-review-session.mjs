#!/usr/bin/env node
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const cli = path.resolve(
  process.argv[2] || fileURLToPath(new URL("./review-session.mjs", import.meta.url)),
);
const syncCli = path.resolve(
  process.argv[3] || fileURLToPath(new URL("./refinement-sync.mjs", import.meta.url)),
);
const root = fs.mkdtempSync(path.join(os.tmpdir(), "review-session-test-"));
const write = (relative, body) => {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
  return file;
};
const json = (relative, value) => write(relative, `${JSON.stringify(value, null, 2)}\n`);
const run = (...args) => spawnSync(process.execPath, [cli, ...args], {
  cwd: root,
  encoding: "utf8",
});
const runSync = (...args) => spawnSync(process.execPath, [syncCli, ...args], {
  cwd: root,
  encoding: "utf8",
});
const parse = (result) => JSON.parse(result.stdout || result.stderr);
const digest = (body) => crypto
  .createHash("sha256")
  .update(`${body.replace(/\r\n?/g, "\n").replace(/\n*$/g, "")}\n`)
  .digest("hex");
const evidence = (relative, revisions) => json(relative, {
  schema_version: 1,
  read_at: new Date().toISOString(),
  pages: Object.entries(revisions).map(([notion_page_id, revision]) => ({
    notion_page_id,
    revision,
  })),
});

try {
  const manifest = {
    schema_version: 1,
    project: "demo",
    state_root: "artifacts/_local/notion-sync/demo",
    checkout_root: "artifacts/demo",
    units: [
      {
        id: "00-workflow-state",
        role: "canonical",
        notion_page_id: "page-state",
        local_path: "00-workflow-state.md",
      },
      {
        id: "US-DEMO-01",
        role: "derived",
        notion_page_id: "page-story",
        local_path: "jira/US-DEMO-01.md",
      },
    ],
    presentations: [
      {
        id: "project-cover",
        role: "presentation",
        notion_page_id: "page-cover",
        remote_path: "_presentation/project-cover.md",
      },
    ],
  };
  json("manifest.json", manifest);
  json("registry.json", {
    schema_version: 1,
    projects: {
      demo: {
        manifest_file: "manifest.json",
        state_root: manifest.state_root,
        checkout_root: manifest.checkout_root,
      },
    },
  });
  write("remote/00-workflow-state.md", "# State\n");
  write("remote/jira/US-DEMO-01.md", "# Story\n");
  write("remote/_presentation/project-cover.md", "# Cover\n");
  const firstEvidence = evidence("freshness-1.json", {
    "page-state": "1",
    "page-story": "1",
    "page-cover": "1",
  });

  const capture = run(
    "capture", "demo", "--remote-dir", "remote", "--freshness-evidence", firstEvidence,
    "--registry", "registry.json",
  );
  assert.equal(capture.status, 0, capture.stderr);
  assert.equal(parse(capture).freshness_mode, "page-revision");

  const status = run("status", "demo", "--registry", "registry.json");
  assert.equal(status.status, 0, status.stderr);
  assert.deepEqual(parse(status).cache_damaged, []);

  const current = run(
    "check", "demo", "--freshness-evidence", firstEvidence, "--registry", "registry.json",
  );
  assert.equal(current.status, 0, current.stderr);
  assert.equal(parse(current).current, true);
  assert.equal(parse(current).checked_pages, 3);
  assert.equal(parse(current).manifest_page_count, 3);
  assert.match(parse(current).freshness_evidence_sha256, /^[0-9a-f]{64}$/);
  assert.match(parse(current).manifest_sha256, /^[0-9a-f]{64}$/);
  assert.equal(parse(current).manifest_file, "manifest.json");

  const secondEvidence = evidence("freshness-2.json", {
    "page-state": "2",
    "page-story": "1",
    "page-cover": "1",
  });
  const requiresPage = run(
    "check", "demo", "--freshness-evidence", secondEvidence, "--registry", "registry.json",
  );
  assert.equal(requiresPage.status, 2, requiresPage.stderr);
  assert.deepEqual(parse(requiresPage).required_content, ["00-workflow-state"]);

  write("changed/00-workflow-state.md", "# State updated\n");
  const refreshed = run(
    "check", "demo", "--freshness-evidence", secondEvidence, "--changed-dir", "changed",
    "--registry", "registry.json",
  );
  assert.equal(refreshed.status, 0, refreshed.stderr);
  assert.deepEqual(parse(refreshed).changed, ["00-workflow-state"]);

  const incompleteEvidence = evidence("freshness-incomplete.json", {
    "page-state": "2",
    "page-story": "1",
  });
  const incomplete = run(
    "check", "demo", "--freshness-evidence", incompleteEvidence, "--registry", "registry.json",
  );
  assert.equal(incomplete.status, 2, incomplete.stderr);
  assert.equal(parse(incomplete).full_refresh_required, true);

  json("outbox/write-set.json", {
    units: [{ id: "US-DEMO-01", local_path: "jira/US-DEMO-01.md" }],
  });
  write("outbox/jira/US-DEMO-01.md", "# Story updated\n");
  write("readback/jira/US-DEMO-01.md", "# Story updated\n");
  const publishEvidence = evidence("freshness-publish.json", {
    "page-state": "2",
    "page-story": "2",
    "page-cover": "1",
  });
  const assembled = run(
    "assemble-readback", "demo", "--outbox", "outbox", "--readback-dir", "readback",
    "--freshness-evidence", publishEvidence, "--registry", "registry.json",
  );
  assert.equal(assembled.status, 0, assembled.stderr);
  const assembledPayload = parse(assembled);
  assert.deepEqual(assembledPayload.expected_changes, ["US-DEMO-01"]);
  assert.equal(
    fs.readFileSync(path.join(root, assembledPayload.resolved_remote_dir, "00-workflow-state.md"), "utf8"),
    "# State updated\n",
  );
  assert.equal(
    fs.readFileSync(path.join(root, assembledPayload.resolved_remote_dir, "jira/US-DEMO-01.md"), "utf8"),
    "# Story updated\n",
  );
  write("artifacts/demo/00-workflow-state.md", "# State updated\n");
  write("artifacts/demo/jira/US-DEMO-01.md", "# Story updated\n");
  json("artifacts/_local/notion-sync/demo/base.json", {
    schema_version: 1,
    project: "demo",
    units: [
      { id: "00-workflow-state", sha256: digest("# State updated\n") },
      { id: "US-DEMO-01", sha256: digest("# Story\n") },
    ],
  });
  const verified = runSync(
    "publish", "demo", "--verify", "--outbox", path.join(root, "outbox"),
    "--remote-dir", assembledPayload.resolved_remote_dir, "--registry", "registry.json",
  );
  assert.equal(verified.status, 0, verified.stderr);
  assert.equal(parse(verified).operation, "publish-verify");

  const driftEvidence = evidence("freshness-drift.json", {
    "page-state": "2",
    "page-story": "2",
    "page-cover": "2",
  });
  const drift = run(
    "assemble-readback", "demo", "--outbox", "outbox", "--readback-dir", "readback",
    "--freshness-evidence", driftEvidence, "--registry", "registry.json",
  );
  assert.equal(drift.status, 2, drift.stderr);
  assert.deepEqual(parse(drift).unexpected_changes, ["project-cover"]);

  const activeStatus = run("status", "demo", "--registry", "registry.json");
  const cachedCover = path.join(root, parse(activeStatus).remote_dir, "_presentation/project-cover.md");
  fs.writeFileSync(cachedCover, "# Tampered cache\n");
  const damaged = run("status", "demo", "--registry", "registry.json");
  assert.equal(damaged.status, 2, damaged.stderr);
  assert.deepEqual(parse(damaged).cache_damaged, ["project-cover"]);
  fs.writeFileSync(cachedCover, "# Cover\n");

  const changedManifest = JSON.parse(JSON.stringify(manifest));
  changedManifest.presentations[0].notion_page_id = "different-cover-page";
  json("manifest.json", changedManifest);
  const identityChanged = run("status", "demo", "--registry", "registry.json");
  assert.equal(identityChanged.status, 2, identityChanged.stderr);
  assert.equal(parse(identityChanged).manifest_changed, true);
  json("manifest.json", manifest);

  const migrationBase = evidence("freshness-migration-base.json", {
    "page-state": "2026-08-13T10:00:00Z",
    "page-story": "2026-08-13T10:00:00Z",
    "page-cover": "2026-08-13T10:00:00Z",
  });
  const migrationCapture = run(
    "capture", "demo", "--remote-dir", "remote", "--freshness-evidence", migrationBase,
    "--registry", "registry.json",
  );
  assert.equal(migrationCapture.status, 0, migrationCapture.stderr);
  const preciseEvidence = evidence("freshness-migration-exact.json", {
    "page-state": "2026-08-13T10:00:15.123Z",
    "page-story": "2026-08-13T10:00:20.456Z",
    "page-cover": "2026-08-13T10:00:30.789Z",
  });
  const migrated = run(
    "migrate-evidence", "demo", "--freshness-evidence", preciseEvidence,
    "--registry", "registry.json",
  );
  assert.equal(migrated.status, 0, migrated.stderr);
  assert.equal(parse(migrated).content_downloads, 0);
  assert.equal(parse(migrated).migrated_pages.length, 3);

  const contentOnly = run(
    "capture", "demo", "--remote-dir", "remote", "--registry", "registry.json",
  );
  assert.equal(contentOnly.status, 0, contentOnly.stderr);
  const unsafeCheck = run(
    "check", "demo", "--freshness-evidence", firstEvidence, "--registry", "registry.json",
  );
  assert.equal(unsafeCheck.status, 2, unsafeCheck.stderr);
  assert.equal(parse(unsafeCheck).full_refresh_required, true);

  console.log(JSON.stringify({ ok: true, tests: 20 }, null, 2));
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
