#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const command = args.shift();
const value = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
};
const fail = (message, details = {}) => {
  console.error(JSON.stringify({ ok: false, message, ...details }, null, 2));
  process.exit(1);
};
const digest = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");

if (!["create", "replace"].includes(command)) {
  fail("Usage: materialize-local-evidence.mjs <create|replace> --candidate <file> --out <file> --expected-sha256 <sha> [--expected-current-sha256 <sha>]");
}
const candidate = value("--candidate") && path.resolve(value("--candidate"));
const out = value("--out") && path.resolve(value("--out"));
const expected = value("--expected-sha256");
if (!candidate || !out || !/^[a-f0-9]{64}$/u.test(expected || "")) fail("Candidate, output and lowercase expected SHA-256 are required");
if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) fail("Candidate does not exist", { candidate });
const bytes = fs.readFileSync(candidate);
const candidateSha = digest(bytes);
if (candidateSha !== expected) fail("Candidate hash does not match authorization", { expected, actual: candidateSha });

fs.mkdirSync(path.dirname(out), { recursive: true });
if (command === "create") {
  if (fs.existsSync(out)) fail("Output already exists; immutable evidence cannot be overwritten", { out });
  const handle = fs.openSync(out, "wx");
  try { fs.writeFileSync(handle, bytes); } finally { fs.closeSync(handle); }
} else {
  const currentExpected = value("--expected-current-sha256");
  if (!fs.existsSync(out) || !/^[a-f0-9]{64}$/u.test(currentExpected || "")) {
    fail("Replace requires an existing output and --expected-current-sha256");
  }
  const current = digest(fs.readFileSync(out));
  if (current !== currentExpected) fail("Current output hash changed", { expected: currentExpected, actual: current });
  const temporary = `${out}.tmp-${process.pid}-${crypto.randomBytes(6).toString("hex")}`;
  try {
    fs.writeFileSync(temporary, bytes, { flag: "wx" });
    fs.renameSync(temporary, out);
  } finally {
    if (fs.existsSync(temporary)) fs.rmSync(temporary);
  }
}

const finalSha = digest(fs.readFileSync(out));
if (finalSha !== expected) fail("Materialized output hash mismatch", { expected, actual: finalSha });
console.log(JSON.stringify({ ok: true, command, out, sha256: finalSha, bytes: bytes.length }, null, 2));

