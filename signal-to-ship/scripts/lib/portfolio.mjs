// Portfolio view across Signal to Ship state files: what shipped, what it was meant to move,
// and whether anyone has looked since. Pure functions; the CLI is scripts/portfolio.mjs.
import { isIsoDate, deployUnconfirmed, backlogNotice } from './state.mjs'

const dash = (v) => (v === null || v === undefined || v === '' ? '-' : String(v))
const cell = (v) => dash(v).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ')
const byText = (a, b) => (a < b ? -1 : a > b ? 1 : 0)

/** Days between the hypothesis and the first real evidence, or null when either date is missing. */
function learningDays(l) {
  if (!l || !isIsoDate(l.hypothesis_formed) || !isIsoDate(l.first_evidence)) return null
  return Math.round((Date.parse(`${l.first_evidence}T00:00:00Z`) - Date.parse(`${l.hypothesis_formed}T00:00:00Z`)) / 86400000)
}

/** One portfolio row from a parsed state object. */
export function toRow(s, file = '', today = null) {
  const m = s.measurement || {}
  const o = s.outcome || {}
  const delivered = s.gates?.delivery === 'passed'
  const date = isIsoDate(s.delivery?.deployed_on) ? s.delivery.deployed_on : s.delivery?.delivery_date
  return {
    file,
    schema: s.schema,
    badDelivery: delivered && !isIsoDate(date),
    deployUnconfirmed: today ? deployUnconfirmed(s, today) : null,
    feature: s.feature ?? '(unnamed)',
    type: s.initiative_type,
    depth: s.depth,
    phase: s.current_phase,
    status: s.status === 'stopped' ? 'stopped' : backlogNotice(s) ? 'backlog' : s.status || 'active',
    delivered: delivered && isIsoDate(date) ? date : null,
    outcome: o.metric ? `${o.metric}: ${dash(o.baseline)} -> ${dash(o.target)}` : null,
    adoptionD30: typeof m.adoption_d30 === 'number' ? m.adoption_d30 : null,
    day30Due: isIsoDate(m.checkpoint_2) ? m.checkpoint_2 : null,
    verdict: m.verdict ?? null,
    learningDays: learningDays(s.learning),
  }
}

/**
 * Feature-factory smell: among the last `window` delivered features whose Day-30 checkpoint
 * has passed, which have no recorded adoption? Stopped initiatives are not counted.
 */
export function factoryAlert(rows, today, window = 3) {
  const lastDelivered = rows
    .filter((r) => r.delivered && r.status !== 'stopped')
    .sort((a, b) => byText(b.delivered, a.delivered) || byText(a.feature, b.feature))
    .slice(0, window)
  const blind = lastDelivered.filter((r) => r.day30Due && r.day30Due <= today && r.adoptionD30 === null)
  return { checked: lastDelivered.length, blind }
}

/** Build the markdown report from {file, state} entries (state may be null when unparseable). */
export function buildPortfolio(entries, today) {
  const rows = entries.filter((e) => e.state).map((e) => toRow(e.state, e.file, today))
  const bad = entries.filter((e) => !e.state)
  const order = (r) => (r.status === 'stopped' ? 2 : r.delivered ? 1 : 0)
  rows.sort((a, b) => order(a) - order(b) || byText(a.feature, b.feature))

  const lines = ['# Portfolio', '', `As of ${today}. ${rows.length} initiative${rows.length === 1 ? '' : 's'}.`, '']
  if (rows.length) {
    lines.push('| Feature | Type / depth | Phase | Status | Delivered | Outcome (baseline -> target) | Day-30 adoption | Days to first evidence | Verdict |')
    lines.push('|---|---|---|---|---|---|---|---|---|')
    for (const r of rows) {
      const adopt = r.adoptionD30 !== null ? `${r.adoptionD30}%` : r.day30Due && r.day30Due <= today ? 'MISSING' : '-'
      lines.push(`| ${cell(r.feature)} | ${cell(r.type)} / ${cell(r.depth)} | ${cell(r.phase)} | ${cell(r.status)} | ${cell(r.delivered)} | ${cell(r.outcome)} | ${adopt} | ${r.learningDays === null ? '-' : r.learningDays} | ${cell(r.verdict)} |`)
    }
    lines.push('')
  }
  const { checked, blind } = factoryAlert(rows, today)
  if (blind.length) {
    lines.push(`**Feature-factory signal:** ${blind.length} of the last ${checked} delivered feature${checked === 1 ? '' : 's'} ` +
      `has no Day-30 adoption recorded (${blind.map((r) => r.feature).join(', ')}). Measure it before starting anything new.`, '')
  }
  // schema 1 has no outcome block, so it is not flagged for lacking one
  const noOutcome = rows.filter((r) => r.schema === 2 && r.status !== 'stopped' && !r.outcome && r.depth !== 'light')
  if (noOutcome.length) {
    lines.push(`**No outcome defined:** ${noOutcome.map((r) => r.feature).join(', ')}. A roadmap item without a baseline and a target is an output.`, '')
  }
  const parked = rows.filter((r) => r.status === 'backlog')
  if (parked.length) {
    lines.push(`**In backlog:** ${parked.map((r) => r.feature).join(', ')}. Parked at a prioritization pass; ask whether to start now.`, '')
  }
  const badDates = rows.filter((r) => r.badDelivery)
  if (badDates.length) {
    lines.push(`**Check the data:** ${badDates.map((r) => r.feature).join(', ')} passed delivery but delivery.delivery_date is missing or not an ISO date, so it is left out of the adoption check.`, '')
  }
  const unconfirmed = rows.filter((r) => r.deployUnconfirmed)
  if (unconfirmed.length) {
    lines.push(`**Confirm the deploy date:** ${unconfirmed.map((r) => `${r.feature} (planned ${r.deployUnconfirmed})`).join(', ')}. Set delivery.deployed_on so the checkpoints start from the day it really shipped.`, '')
  }
  if (bad.length) lines.push(`**Could not read:** ${bad.map((e) => e.file).join(', ')}`, '')
  return lines.join('\n')
}
