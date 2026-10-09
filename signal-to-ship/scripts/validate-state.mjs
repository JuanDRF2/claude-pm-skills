#!/usr/bin/env node
// validate-state.mjs — checks a Signal to Ship state file (YAML frontmatter).
// Usage: node scripts/validate-state.mjs <state-file> [--today YYYY-MM-DD]
// Exit codes: 0 valid (warnings allowed), 1 validation errors, 2 usage / parse error.
import { readFileSync } from 'node:fs'
import { parseFrontmatter, validateState, dueCheckpoints, deployUnconfirmed, stoppedNotice, backlogNotice } from './lib/state.mjs'

const args = process.argv.slice(2)
const file = args.find((a) => !a.startsWith('--'))
const ti = args.indexOf('--today')
const today = ti >= 0 ? args[ti + 1] : new Date().toISOString().slice(0, 10)
if (!file) { console.error('usage: validate-state.mjs <state-file> [--today YYYY-MM-DD]'); process.exit(2) }

let state
try { state = parseFrontmatter(readFileSync(file, 'utf8')) } catch (e) { console.error(`validate-state: ${e.message}`); process.exit(2) }

const findings = validateState(state)
for (const f of findings) console.log(`${f.severity === 'error' ? 'ERROR' : 'warn '} ${f.code}: ${f.message}`)
const stop = stoppedNotice(state)
if (stop) console.log(`STOPPED  initiative is stopped (${stop.reason ?? 'no reason recorded'}, ${stop.on ?? 'no date'}) - ask whether to reopen it or leave it stopped`)
const parked = backlogNotice(state)
if (parked) console.log(`BACKLOG  initiative is in the backlog (${parked.from === 'pass2' ? 'pass2' : 'pass1'} decision) - ask whether to start it now`)
for (const d of dueCheckpoints(state, today)) console.log(`DUE   checkpoint ${d.n} passed on ${d.due} — surface it to the PM before anything else`)
const planned = deployUnconfirmed(state, today)
if (planned) console.log(`ASK   delivery was planned for ${planned} and delivery.deployed_on is empty — ask the PM whether it shipped, and when`)
const errors = findings.filter((f) => f.severity === 'error').length
console.log(errors ? `validate-state: FAIL (${errors} error${errors > 1 ? 's' : ''})` : 'validate-state: OK')
process.exit(errors ? 1 : 0)
