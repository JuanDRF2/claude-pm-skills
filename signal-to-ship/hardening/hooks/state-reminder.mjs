#!/usr/bin/env node
// state-reminder — Stop hook.
// If the assistant just announced a gate outcome but the case's state file was not saved
// recently, add a reminder to save it. Silent otherwise. Never loops (honors stop_hook_active).
import { readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const lib = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'scripts', 'lib')
const { findStatesDown, STATE_NAME } = await import(pathToFileURL(join(lib, 'find-state.mjs')).href)

const FRESH_MS = 120_000
const GATE_ANNOUNCEMENT = /\bgate\s*[0-7]\b[^.\n]{0,80}\b(passed|closed|approved|skipped|provisional)\b|\b(passed|closed|approved|skipped)\b[^.\n]{0,40}\bgate\s*[0-7]\b/i

try {
  let payload = {}
  try { payload = JSON.parse(readFileSync(0, 'utf8')) } catch { process.exit(0) }
  if (payload.stop_hook_active) process.exit(0)
  const message = String(payload.last_assistant_message || '')
  if (!GATE_ANNOUNCEMENT.test(message)) process.exit(0)

  const cwd = payload.cwd || process.cwd()
  const states = findStatesDown(cwd)
  if (!states.length) process.exit(0)

  const newest = Math.max(...states.map((p) => statSync(p).mtimeMs))
  if (Date.now() - newest <= FRESH_MS) process.exit(0)

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'Stop',
      additionalContext: `Reminder: a gate outcome was announced but no ${STATE_NAME} was saved in the last two minutes. Update the state file (and run node scripts/validate-state.mjs on it) before ending.`,
    },
  }))
} catch {
  // never break the session
}
process.exit(0)
