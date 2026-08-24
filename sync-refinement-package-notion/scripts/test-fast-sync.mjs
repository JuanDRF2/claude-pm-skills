#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "fast-sync-"));
const local = path.join(root, "local");
const remote = path.join(root, "remote");
const readback = path.join(root, "readback");
for (const dir of [local, remote, readback]) fs.mkdirSync(dir, { recursive: true });
const write = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value, "utf8");
};
const json = (file, value) => write(file, `${JSON.stringify(value, null, 2)}\n`);
const manifest = {
  project: "demo",
  units: [
    { id: "A", notion_page_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", local_path: "A.md" },
    { id: "B", notion_page_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", local_path: "B.md" },
  ],
  presentations: [
    { id: "cover", notion_page_id: "cccccccc-cccc-cccc-cccc-cccccccccccc", remote_path: "_presentation/cover.md" },
  ],
};
json(path.join(root, "manifest.json"), manifest);
write(path.join(local, "A.md"), "# A\n\nOld\n");
write(path.join(local, "B.md"), "# B\n\nKeep\n");
write(path.join(remote, "A.md"), "# A\n\nOld\n");
write(path.join(remote, "B.md"), "# B\n\nKeep\n");
write(path.join(remote, "_presentation/cover.md"), "# Cover\n\nRemote view\n");
const script = fileURLToPath(new URL("./fast-sync.mjs", import.meta.url));
const run = (command, flags, expected = 0) => {
  const argv = [script, command];
  for (const [key, value] of Object.entries(flags)) argv.push(`--${key}`, value);
  const result = spawnSync(process.execPath, argv, { encoding: "utf8" });
  assert.equal(result.status, expected, `${command}: ${result.stderr || result.stdout}`);
  return result;
};
const baseline = path.join(root, "baseline.json");
run("capture", { manifest: path.join(root, "manifest.json"), "local-dir": local, "remote-dir": remote, out: baseline });

json(path.join(root, "manifest-drift.json"), { ...manifest, project: "different" });
json(path.join(root, "impact-empty.json"), { units: [], excluded_units: [] });
run("plan", { manifest: path.join(root, "manifest-drift.json"), baseline, "local-dir": local, impact: path.join(root, "impact-empty.json"), out: path.join(root, "drift-plan.json") }, 1);

write(path.join(local, "A.md"), "# A\n\nNew\n");
json(path.join(root, "impact-missing.json"), { units: [], excluded_units: [] });
run("plan", { manifest: path.join(root, "manifest.json"), baseline, "local-dir": local, impact: path.join(root, "impact-missing.json"), out: path.join(root, "bad-plan.json") }, 1);

json(path.join(root, "impact.json"), { units: [{ id: "A", classification: "approved-scope", reason: "approved" }], excluded_units: [] });
const plan = path.join(root, "plan.json");
run("plan", { manifest: path.join(root, "manifest.json"), baseline, "local-dir": local, impact: path.join(root, "impact.json"), out: plan });
fs.unlinkSync(path.join(remote, "B.md"));
const dossier = path.join(root, "dossier.json");
run("preflight", { manifest: path.join(root, "manifest.json"), baseline, "local-dir": local, "remote-dir": remote, plan, out: dossier });
assert.equal(JSON.parse(fs.readFileSync(dossier)).writes.length, 1);

write(path.join(readback, "A.md"), "# A\n\nNew\n\n");
const receipt = path.join(root, "receipt.json");
const nextBaseline = path.join(root, "baseline-next.json");
run("verify", { manifest: path.join(root, "manifest.json"), baseline, "local-dir": local, "readback-dir": readback, dossier, out: receipt, "updated-baseline": nextBaseline });
const next = JSON.parse(fs.readFileSync(nextBaseline));
const previous = JSON.parse(fs.readFileSync(baseline));
assert.equal(next.entries.find((entry) => entry.id === "B").remote_sha256, previous.entries.find((entry) => entry.id === "B").remote_sha256);

write(path.join(remote, "A.md"), "# A\n\nConcurrent edit\n");
run("preflight", { manifest: path.join(root, "manifest.json"), baseline, "local-dir": local, "remote-dir": remote, plan, out: path.join(root, "conflict.json") }, 2);

write(path.join(remote, "A.md"), "# A\n\nNew\n");
const noOp = path.join(root, "noop.json");
run("preflight", { manifest: path.join(root, "manifest.json"), baseline, "local-dir": local, "remote-dir": remote, plan, out: noOp });
assert.equal(JSON.parse(fs.readFileSync(noOp)).verification_pages.length, 1);

process.stdout.write("fast-sync: all tests passed\n");
