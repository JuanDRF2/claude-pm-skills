#!/usr/bin/env bash
# leak-scan.sh: sanitization gate. Scans the repository for terms on a private denylist.
# The denylist is NOT in this repository (a denylist inside would itself be a leak). It is read from the file
# whose path is in SANITIZE_DENYLIST: one term per line, extended regex, matched case-insensitively,
# lines starting with # are comments.
#   Local:  SANITIZE_DENYLIST=/path/to/denylist.txt bash scripts/leak-scan.sh [path]
#   CI:     the workflow writes the repository secret of the same name to a temporary file.
# Exit codes: 0 clean or skipped (no denylist available), 1 denylisted term found, 2 the scan itself failed
# (an invalid regex in the denylist, or grep could not run). A failed scan is never reported as clean.
# It never prints the denylist or the matched term, only file:line.
set -uo pipefail
DENY="${SANITIZE_DENYLIST:-}"
ROOT="${1:-.}"
if [ -z "$DENY" ]; then
  echo "leak-scan: SKIPPED. No denylist available (SANITIZE_DENYLIST is not set)."
  echo "  This is expected on forks and until the repository secret SANITIZE_DENYLIST is set. Nothing was scanned."
  exit 0
fi
if [ ! -s "$DENY" ]; then
  echo "leak-scan: FAIL. SANITIZE_DENYLIST points to a file that is missing or empty. Nothing was scanned." >&2
  exit 2
fi

CLEAN="$(mktemp)"
trap 'rm -f "$CLEAN"' EXIT
umask 077
grep -vE '^[[:space:]]*(#|$)' "$DENY" > "$CLEAN" || true
if [ ! -s "$CLEAN" ]; then
  echo "leak-scan: SKIPPED. The denylist has no terms. Nothing was scanned."
  exit 0
fi

# Validate every line as an extended regex. grep returns 0 or 1 for a valid pattern and 2 for an invalid one.
# Only the line number is printed, never the term.
n=0
while IFS= read -r line || [ -n "$line" ]; do
  n=$((n + 1))
  printf '' | grep -E -e "$line" >/dev/null 2>&1
  rc=$?
  if [ "$rc" -gt 1 ]; then
    echo "leak-scan: FAIL. Line $n of the cleaned denylist is not a valid extended regex. Nothing was scanned." >&2
    exit 2
  fi
done < "$CLEAN"

# -f reads the patterns from the file. Output is reduced with cut so matched text never reaches the log.
OUT="$(grep -rIniE --exclude-dir=.git --exclude-dir=node_modules -f "$CLEAN" "$ROOT" 2>/dev/null)"
rc=$?
if [ "$rc" -eq 0 ]; then
  echo "leak-scan: FAIL. Denylisted terms found at (file:line, terms not shown):" >&2
  printf '%s\n' "$OUT" | cut -d: -f1,2 >&2
  exit 1
fi
if [ "$rc" -eq 1 ]; then
  echo "leak-scan: OK (no denylisted terms found)"
  exit 0
fi
# rc >= 2: grep hit an error. If it still printed matches, report them as a failure; otherwise the scan is unreliable.
if [ -n "$OUT" ]; then
  echo "leak-scan: FAIL. Denylisted terms found at (file:line, terms not shown), and grep also reported errors:" >&2
  printf '%s\n' "$OUT" | cut -d: -f1,2 >&2
  exit 1
fi
echo "leak-scan: FAIL. grep could not complete the scan (exit $rc). Treating it as not clean." >&2
exit 2
