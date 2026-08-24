#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const serializer = process.argv[2] || fileURLToPath(new URL("./serialize-notion-fetch.mjs", import.meta.url));
const root = fs.mkdtempSync(path.join(os.tmpdir(), "notion-fetch-serializer-"));
try {
  const out = path.join(root, "remote.md");
  const input = `prefix
<page><content>
# Reglas
<table header-row="true">
<tr><td>ID</td><td>Regla</td></tr>
<tr><td>BR-01</td><td>Primera</td></tr>
</table>
<table>
<tr><td>BR-02</td><td>Segunda</td></tr>
</table>
## Estado
- Vigente
</content></page>`;
  const result = spawnSync(process.execPath, [serializer, "--out", out], {
    input,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    fs.readFileSync(out, "utf8"),
    `# Reglas

| ID | Regla |
|---|---|
| BR-01 | Primera |
| BR-02 | Segunda |

## Estado

- Vigente
`,
  );

  const fencedInput = [
    "<page><content>",
    "## Escenario",
    "```gherkin",
    "Dado un caso",
    "Entonces conserva la tabla",
    "",
    "Ejemplos:",
    "| Caso | Resultado |",
    "|---|---|",
    "| 1 | visible |",
    "```",
    "## Literales",
    "~~~~text",
    "# no es heading",
    "> no es cita",
    "| no | es | tabla |",
    "~~~~",
    "</content></page>",
  ].join("\n");
  const fencedExpected = [
    "## Escenario", "", "```gherkin", "Dado un caso",
    "Entonces conserva la tabla", "", "Ejemplos:", "| Caso | Resultado |",
    "|---|---|", "| 1 | visible |", "```", "", "## Literales", "",
    "~~~~text", "# no es heading", "> no es cita", "| no | es | tabla |",
    "~~~~", "",
  ].join("\n");
  const fenced = spawnSync(process.execPath, [serializer, "--out", out], {
    input: fencedInput,
    encoding: "utf8",
  });
  assert.equal(fenced.status, 0, fenced.stderr);
  assert.equal(fs.readFileSync(out, "utf8"), fencedExpected);

  const fencedBase = path.join(root, "fenced-base.md");
  fs.writeFileSync(fencedBase, fencedExpected);
  const fencedEquivalent = spawnSync(
    process.execPath,
    [serializer, "--out", out, "--base", fencedBase],
    { input: fencedInput, encoding: "utf8" },
  );
  assert.equal(fencedEquivalent.status, 0, fencedEquivalent.stderr);
  assert.equal(JSON.parse(fencedEquivalent.stdout).equivalent, true);
  assert.equal(fs.readFileSync(out, "utf8"), fencedExpected);

  const incomplete = spawnSync(process.execPath, [serializer, "--out", out], {
    input: "<page><content>truncated",
    encoding: "utf8",
  });
  assert.equal(incomplete.status, 3);

  const base = path.join(root, "base.md");
  const manifest = path.join(root, "manifest.json");
  fs.writeFileSync(base, "# Referencia\n\nVer [contrato](contract.md).  \nSiguiente línea.\n");
  fs.writeFileSync(
    manifest,
    JSON.stringify({
      units: [
        { id: "current", local_path: "story.md", notion_page_id: "current" },
        { id: "contract", local_path: "contract.md", notion_page_id: "abcd-1234" },
      ],
    }),
  );
  const equivalent = spawnSync(
    process.execPath,
    [serializer, "--out", out, "--base", base, "--manifest", manifest, "--unit-id", "current"],
    {
      input:
        '<page><content># Referencia\nVer [contrato](https://app.notion.com/p/abcd1234).\nSiguiente línea.</content></page>',
      encoding: "utf8",
    },
  );
  assert.equal(equivalent.status, 0, equivalent.stderr);
  assert.equal(JSON.parse(equivalent.stdout).equivalent, true);
  assert.equal(fs.readFileSync(out, "utf8"), fs.readFileSync(base, "utf8"));

  const changed = spawnSync(
    process.execPath,
    [serializer, "--out", out, "--base", base, "--manifest", manifest, "--unit-id", "current"],
    {
      input:
        '<page><content># Referencia\nVer [contrato](https://app.notion.com/p/abcd1234).\nTexto cambiado.</content></page>',
      encoding: "utf8",
    },
  );
  assert.equal(changed.status, 0, changed.stderr);
  assert.equal(JSON.parse(changed.stdout).equivalent, false);
  console.log(JSON.stringify({ ok: true, tests: 6 }));
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
