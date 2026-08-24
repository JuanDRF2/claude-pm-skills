import crypto from "node:crypto";
import path from "node:path";

export const normalizeBuffer = (value) => {
  const text = Buffer.isBuffer(value) ? value.toString("utf8") : String(value ?? "");
  return Buffer.from(`${text.replace(/\r\n?/g, "\n").replace(/\n*$/g, "")}\n`);
};

export const sha256 = (value) =>
  crypto.createHash("sha256").update(normalizeBuffer(value)).digest("hex");

const pageIdFromNotionUrl = (target) => {
  const match = String(target).match(
    /https:\/\/(?:www\.)?(?:app\.)?notion\.(?:com|so)\/(?:p\/)?(?:[^?#/]*-)?([a-f0-9]{32})(?:[?#/]|$)/i,
  );
  return match ? match[1].toLowerCase() : null;
};

const normalizePageId = (value) => String(value || "").replace(/-/g, "").toLowerCase();

const manifestItems = (manifest) => [
  ...(manifest?.units || []),
  ...(manifest?.presentations || []),
];

const pageIdFromManifestUrl = (target, manifest) => {
  const compactTarget = String(target || "").replace(/[^a-f0-9]/gi, "").toLowerCase();
  const destination = manifestItems(manifest).find((item) => {
    const compactId = normalizePageId(item.notion_page_id);
    return compactId && compactTarget.endsWith(compactId);
  });
  return destination ? normalizePageId(destination.notion_page_id) : null;
};

const resolveRelativeTarget = (target, manifest, unitId) => {
  if (!manifest || !unitId || !target || /^(?:[a-z]+:|#|\/)/i.test(target)) return null;
  const current = manifestItems(manifest).find((item) => item.id === unitId);
  if (!current) return null;
  const currentPath = current.local_path || current.remote_path;
  if (!currentPath) return null;
  const withoutFragment = target.split("#")[0].split("?")[0];
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(currentPath), withoutFragment));
  const destination = manifestItems(manifest).find((item) =>
    [item.local_path, item.remote_path].filter(Boolean).some((candidate) =>
      path.posix.normalize(candidate) === resolved,
    ),
  );
  return destination?.notion_page_id ? normalizePageId(destination.notion_page_id) : null;
};

export const canonicalLinkTarget = (target, { manifest = null, unitId = null } = {}) => {
  const raw = String(target || "").trim();
  const notionId = pageIdFromNotionUrl(raw) || pageIdFromManifestUrl(raw, manifest) || resolveRelativeTarget(raw, manifest, unitId);
  if (notionId) return `notion:${notionId}`;
  return raw;
};

const normalizeLinkLabel = (label) => String(label)
  .replace(/^\*{1,2}(`[^`]+`)\*{1,2}$/u, "$1")
  .replace(/^_{1,2}(`[^`]+`)_{1,2}$/u, "$1")
  .replace(/^`([^`]+)`$/u, "$1");

const normalizeInline = (line, options) => {
  let result = line
    .replace(/\\\$/g, "$")
    .replace(/\*{1,2}(`[^`]+`)\*{1,2}/g, "$1")
    .replace(/_{1,2}(`[^`]+`)_{1,2}/g, "$1");
  let previous;
  do {
    previous = result;
    result = result.replace(
      /\[([^\]]*)\]\(([^)\s]+)\)\[([^\]]*)\]\(\2\)/g,
      "[$1$3]($2)",
    );
  } while (result !== previous);
  return result.replace(/\[([^\]]*)\]\(([^)\s]+)\)/g, (_match, label, target) =>
    `[${normalizeLinkLabel(label)}](${canonicalLinkTarget(target, options)})`,
  );
};

const mentionPagesToLinks = (text) => text.replace(
  /<mention-page\s+url="([^"]+)"[^>]*>([\s\S]*?)<\/mention-page>/gi,
  (_match, target, label) => `[${label.replace(/<[^>]+>/g, "").trim() || "page"}](${target})`,
);

export const canonicalizeMarkdown = (
  value,
  { dropLeadingTitle = false, manifest = null, unitId = null } = {},
) => {
  const text = mentionPagesToLinks(normalizeBuffer(value).toString("utf8"));
  const lines = text.split("\n");
  if (dropLeadingTitle) {
    const first = lines.findIndex((line) => line.trim());
    if (first >= 0 && /^#\s+\S/u.test(lines[first])) lines.splice(first, 1);
  }
  const result = [];
  let fence = null;
  for (const rawLine of lines) {
    let line = rawLine.trimEnd();
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/u);
    if (marker) {
      const token = marker[1][0];
      fence = fence === token ? null : fence || token;
      result.push(line);
      continue;
    }
    if (fence) {
      result.push(line);
      continue;
    }
    if (!line.trim()) continue;
    if (/^\s*\|(?:\s*:?-{3,}:?\s*\|)+\s*$/u.test(line)) {
      const cells = line.split("|").slice(1, -1);
      line = `| ${cells.map(() => "---").join(" | ")} |`;
    }
    result.push(normalizeInline(line, { manifest, unitId }));
  }
  return `${result.join("\n").replace(/\n*$/g, "")}\n`;
};

export const verifyMarkdownReadback = (expected, actual, options = {}) => {
  if (actual === null || actual === undefined) return { ok: false, mode: "missing" };
  if (sha256(expected) === sha256(actual)) return { ok: true, mode: "exact" };
  const actualComparable = canonicalizeMarkdown(actual, options);
  const expectedComparable = canonicalizeMarkdown(expected, options);
  const expectedWithoutTitle = canonicalizeMarkdown(expected, { ...options, dropLeadingTitle: true });
  if (actualComparable === expectedComparable || actualComparable === expectedWithoutTitle) {
    return { ok: true, mode: "markdown-semantic" };
  }
  return { ok: false, mode: "mismatch" };
};

const occurrences = (text, fragment) => {
  if (!fragment) return 0;
  let count = 0;
  let index = 0;
  while ((index = text.indexOf(fragment, index)) >= 0) {
    count += 1;
    index += Math.max(1, fragment.length);
  }
  return count;
};

export const applyPatchPlan = (source, plan) => {
  const text = normalizeBuffer(source).toString("utf8");
  if (!plan || plan.strategy !== "patch" || occurrences(text, plan.old_fragment) !== 1) return null;
  return text.replace(plan.old_fragment, plan.new_fragment);
};

export const buildPatchPlan = (beforeValue, afterValue, { contextLines = 2 } = {}) => {
  const before = normalizeBuffer(beforeValue).toString("utf8");
  const after = normalizeBuffer(afterValue).toString("utf8");
  if (before === after) return { strategy: "preserve", reason: "no-change" };
  const beforeLines = before.split("\n");
  const afterLines = after.split("\n");
  let prefix = 0;
  while (prefix < beforeLines.length && prefix < afterLines.length && beforeLines[prefix] === afterLines[prefix]) prefix += 1;
  let suffix = 0;
  while (
    suffix < beforeLines.length - prefix &&
    suffix < afterLines.length - prefix &&
    beforeLines[beforeLines.length - 1 - suffix] === afterLines[afterLines.length - 1 - suffix]
  ) suffix += 1;
  const start = Math.max(0, prefix - contextLines);
  const beforeEnd = Math.min(beforeLines.length, beforeLines.length - suffix + contextLines);
  const afterEnd = Math.min(afterLines.length, afterLines.length - suffix + contextLines);
  const oldFragment = beforeLines.slice(start, beforeEnd).join("\n");
  const newFragment = afterLines.slice(start, afterEnd).join("\n");
  if (!oldFragment || occurrences(before, oldFragment) !== 1) {
    return { strategy: "replace", reason: "ambiguous-or-empty-anchor" };
  }
  const plan = {
    schema_version: 1,
    strategy: "patch",
    old_fragment: oldFragment,
    new_fragment: newFragment,
    old_fragment_sha256: sha256(oldFragment),
    new_fragment_sha256: sha256(newFragment),
    target_sha256: sha256(after),
    anchor_occurrences: 1,
  };
  const simulated = applyPatchPlan(before, plan);
  if (!simulated || sha256(simulated) !== sha256(after)) {
    return { strategy: "replace", reason: "patch-simulation-mismatch" };
  }
  return { ...plan, reason: "unique-anchor-and-simulation-pass" };
};

export const findInvalidPublishedMarkdownLinks = (value) => {
  const text = Buffer.isBuffer(value) ? value.toString("utf8") : String(value ?? "");
  return [...text.matchAll(/\[[^\]]*\]\((https?:\/\/[^)\s]+\.md(?:[?#][^)\s]*)?)\)/gi)]
    .map((match) => match[1]);
};

export const verifyThreeWayPatch = ({ base, target, actual, options = {} }) => {
  const targetVerification = verifyMarkdownReadback(target, actual, options);
  return {
    ok: targetVerification.ok,
    mode: targetVerification.ok ? "three-way-patch" : "three-way-mismatch",
    equivalence_mode: targetVerification.mode,
    base_sha256: sha256(base),
    target_sha256: sha256(target),
    actual_sha256: sha256(actual),
    intended_change: canonicalizeMarkdown(base, options) !== canonicalizeMarkdown(target, options),
    unexpected_functional_change: !targetVerification.ok,
  };
};
