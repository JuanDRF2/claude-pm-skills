#!/usr/bin/env node
// portfolio.mjs — one table across every Signal to Ship state file under a directory.
// Usage: node scripts/portfolio.mjs [dir] [--today YYYY-MM-DD]
// Read-only. Regenerated on each run, so there is nothing to keep fresh.
// Exit codes: 0 ok, 2 usage error.
import { readFileSync } from 'node:fs'
import { parseFrontmatter, isIsoDate } from './lib/state.mjs'
import { findStatesDown } from './lib/find-state.mjs'
import { buildPortfolio } from './lib/portfolio.mjs'

let today = new Date().toISOString().slice(0, 10)
const positional = []
const args = process.argv.slice(2)
for (let i = 0; i < args.length; i++) {
  const a = args[i]
  if (a === '--today') today = args[++i]
  else if (a.startsWith('--today=')) today = a.slice('--today='.length)
  else if (a.startsWith('--')) { console.error(`portfolio: unknown option ${a}`); process.exit(2) }
  else positional.push(a)
}
if (!isIsoDate(today)) { console.error(`portfolio: --today must be an ISO date (YYYY-MM-DD), got "${today}"`); process.exit(2) }
const dir = positional[0] || '.'

const entries = findStatesDown(dir).map((file) => {
  try { return { file, state: parseFrontmatter(readFileSync(file, 'utf8')) } } catch { return { file, state: null } }
})
if (!entries.length) { console.log(`portfolio: no 00-signal-to-ship-state.md files found under ${dir}`); process.exit(0) }
console.log(buildPortfolio(entries, today))
