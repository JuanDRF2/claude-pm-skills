#!/usr/bin/env node
// gate-check — PreToolUse hook (matcher: Write|Edit).
// Warns (never blocks) when a delivery document is written before the case's gates allow it.
// Reads the validated YAML frontmatter of 00-signal-to-ship-state.md instead of grepping prose.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const lib = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'scripts', 'lib')
const { parseFrontmatter, validateState, PATH_GATES } = await import(pathToFileURL(join(lib, 'state.mjs')).href)
const { findStateUp } = await import(pathToFileURL(join(lib, 'find-state.mjs')).href)

function advise(text) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: text } }))
}

try {
  let payload = {}
  try { payload = JSON.parse(readFileSync(0, 'utf8')) } catch { process.exit(0) }
  const input = payload.tool_input || {}
  const file = input.file_path || input.path || ''
  if (!/[\\/]delivery[\\/]/.test(file)) process.exit(0)

  const statePath = findStateUp(file)
  if (!statePath) {
    advise('WARNING: No Signal to Ship state file (00-signal-to-ship-state.md) found for this case. Delivery documents should only be written after Gate 5 (Judge PASS). Confirm with the PM before proceeding.')
    process.exit(0)
  }
  let state
  try { state = parseFrontmatter(readFileSync(statePath, 'utf8')) } catch (e) {
    advise(`WARNING: The state file ${statePath} could not be parsed (${e.message}). Fix it before writing delivery documents.`)
    process.exit(0)
  }
  const notes = []
  const required = PATH_GATES[state.path] || []
  if (required.includes(5) && state.gates?.refinement !== 'passed' && state.gates?.refinement !== 'provisional') {
    notes.push('Gate 5 (Refinement Judge PASS) has not been recorded in the state file; writing delivery documents before Judge approval may produce incomplete artifacts. (Paths that skip refinement, such as contractual, are exempt.)')
  }
  // Only gate-order problems matter for a delivery write; unrelated field errors stay out of the way.
  const ORDER = new Set(['E_SCHEMA', 'E_PATH', 'E_GATES', 'E_PATH_GATE', 'E_ORDER'])
  const errors = validateState(state).filter((f) => f.severity === 'error' && ORDER.has(f.code)).slice(0, 3)
  for (const e of errors) notes.push(`State check ${e.code}: ${e.message}`)
  if (notes.length) advise(`WARNING (${statePath}): ${notes.join(' ')} Confirm with the PM before proceeding.`)
} catch {
  // A guard rail must never break the session.
}
process.exit(0)
