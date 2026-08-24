#!/usr/bin/env node

import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "materialize-local-evidence.mjs");
const root = fs.mkdtempSync(path.join(os.tmpdir(), "evidence-materialization-"));
const sha = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });

try {
  const candidateA = path.join(root, "candidate-a.json");
  const candidateB = path.join(root, "candidate-b.json");
  const immutable = path.join(root, "receipt.json");
  const pointer = path.join(root, "current.json");
  const bytesA = Buffer.from('{"version":1}\n');
  const bytesB = Buffer.from('{"version":2}');
  fs.writeFileSync(candidateA, bytesA);
  fs.writeFileSync(candidateB, bytesB);

  assert.equal(run("create", "--candidate", candidateA, "--out", immutable, "--expected-sha256", sha(bytesA)).status, 0);
  assert.deepEqual(fs.readFileSync(immutable), bytesA);
  assert.notEqual(run("create", "--candidate", candidateA, "--out", immutable, "--expected-sha256", sha(bytesA)).status, 0);

  fs.writeFileSync(pointer, bytesA);
  assert.equal(run(
    "replace", "--candidate", candidateB, "--out", pointer,
    "--expected-current-sha256", sha(bytesA), "--expected-sha256", sha(bytesB),
  ).status, 0);
  assert.deepEqual(fs.readFileSync(pointer), bytesB);
  assert.notEqual(run(
    "replace", "--candidate", candidateA, "--out", pointer,
    "--expected-current-sha256", sha(bytesA), "--expected-sha256", sha(bytesA),
  ).status, 0);
  console.log("OK: immutable creation and exact atomic replacement passed (5 checks)");
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

