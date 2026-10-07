// State-file parser and validator for Signal to Ship.
//
// The state file starts with a YAML frontmatter block. We only support a small YAML
// subset (two-space nesting, `key: value` scalars, inline lists) so this has zero
// dependencies and runs anywhere Node does. See templates/signal-to-ship-state.md.

export const GATES = [
  'initiative_type', 'signals', 'prioritization', 'specification',
  'prototyping', 'refinement', 'delivery', 'measurement',
]
const GATE_STATUS = ['pending', 'passed', 'skipped', 'partial', 'provisional']
const TYPES = ['migration', 'new_feature', 'enhancement', 'bug_fix', 'contractual']
// A state saved before Gate 0 closes has no type yet: only valid at phase 0 with Gate 0 still pending.
const UNCONFIRMED = 'unconfirmed'
const TYPE_PATHS = { new_feature: [1, 2], enhancement: [1, 2], migration: [4], bug_fix: [3], contractual: [5] }
const DEPTHS = ['light', 'standard', 'full']
const CLASSES = ['zero_touch', 'auto_activation', 'config_needed', 'data_migration', 'manual_required']
const ROLLOUTS = ['not_set', 'all_at_once', 'beta', 'phased', 'internal_only']
const ASSUMPTION = ['not_required', 'pending', 'tested', 'accepted_untested']
const EVAL = ['not_required', 'draft', 'approved', 'executed']
const RISK_KEYS = ['value', 'usability', 'feasibility', 'viability']
const ORIGINS = ['internal', 'stakeholder', 'customer']
const VERDICTS = ['keep', 'iterate', 'retire']
const STATUSES = ['active', 'stopped']
const ROAST = ['not_run', 'done', 'skipped']
const ANNOUNCEMENT = ['not_sent', 'sent', 'skipped']
const END_USER = ['not_asked', 'done', 'accepted_risk', 'not_applicable']
const DATE = /^\d{4}-\d{2}-\d{2}$/

/** True only for real calendar dates in YYYY-MM-DD form. */
export function isIsoDate(v) {
  if (typeof v !== 'string' || !DATE.test(v)) return false
  const d = new Date(`${v}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v
}

/** Gate indexes (0-7) each path actually runs. */
export const PATH_GATES = {
  1: [0, 1, 2, 3, 4, 5, 6, 7],
  2: [0, 1, 2, 3, 5, 6, 7],
  3: [0, 1, 5, 6],
  4: [0, 1, 3, 5, 6, 7],
  5: [0, 1, 3, 6],
}

// ---- parser ---------------------------------------------------------------

function splitList(inner) {
  const parts = []
  let cur = ''
  let q = null
  for (const ch of inner) {
    if (q) { cur += ch; if (ch === q) q = null }
    else if (ch === '"' || ch === "'") { q = ch; cur += ch }
    else if (ch === ',') { parts.push(cur); cur = '' }
    else cur += ch
  }
  if (q) throw new Error(`Unterminated quote in list: [${inner}]`)
  parts.push(cur)
  return parts
}

function parseScalar(raw) {
  let v = raw.trim()
  if (/^["']/.test(v)) {
    const q = v[0]
    const end = v.indexOf(q, 1)
    if (end < 0) throw new Error(`Unterminated quote: ${raw}`)
    const rest = v.slice(end + 1).trim()
    if (rest && !rest.startsWith('#')) throw new Error(`Trailing characters after quoted value: ${raw}`)
    return v.slice(1, end)
  }
  const hash = v.search(/\s#/)
  if (hash >= 0) v = v.slice(0, hash).trim()
  if (v === '' || v === 'null' || v === '~') return null
  if (v === 'true') return true
  if (v === 'false') return false
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v)
  if (v.startsWith('[') && v.endsWith(']')) {
    const inner = v.slice(1, -1).trim()
    if (!inner) return []
    return splitList(inner).map((x) => parseScalar(x))
  }
  return v
}

/** Parse the leading `---` frontmatter block into a plain object. */
export function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/)
  if (!m) throw new Error('No YAML frontmatter found (file must start with a --- block)')
  return rebuild(m[1])
}

function rebuild(block) {
  const lines = block.split(/\r?\n/).filter((l) => l.trim() && !l.trim().startsWith('#'))
  for (const l of lines) if (/^ *\t/.test(l)) throw new Error(`Tab in indentation is not allowed: "${l}"`)
  function parseLevel(i, indent) {
    const obj = {}
    while (i < lines.length) {
      const line = lines[i]
      const ind = line.match(/^ */)[0].length
      if (ind < indent) break
      if (ind > indent) throw new Error(`Unexpected indentation: "${line}"`)
      const kv = line.trim().match(/^([A-Za-z0-9_]+):(?:\s+(.*)|\s*)$/)
      if (!kv) throw new Error(`Unsupported frontmatter line: "${line}" (use "key: value" lines; write lists inline as [a, b])`)
      const [, key, rest] = kv
      if (key in obj) throw new Error(`Duplicate key "${key}"`)
      const hasValue = rest !== undefined && rest.trim() !== '' && !rest.trim().startsWith('#')
      if (hasValue) { obj[key] = parseScalar(rest); i++; continue }
      const next = lines[i + 1]
      const nextInd = next ? next.match(/^ */)[0].length : -1
      if (next && nextInd > ind) {
        const [child, ni] = parseLevel(i + 1, nextInd)
        obj[key] = child; i = ni
      } else { obj[key] = null; i++ }
    }
    return [obj, i]
  }
  return parseLevel(0, 0)[0]
}

// ---- validator ------------------------------------------------------------

const isNa = (v) => typeof v === 'string' && /^(n\/?a|none|-|—)$/i.test(v.trim())
const empty = (v) => v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)
const err = (code, message) => ({ severity: 'error', code, message })
const warn = (code, message) => ({ severity: 'warn', code, message })

function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** Validate a parsed state object. Returns a list of {severity, code, message}. */
export function validateState(s) {
  const f = []
  if (s.schema !== 1 && s.schema !== 2) f.push(err('E_SCHEMA', `schema must be 1 or 2 (got ${s.schema})`))
  // schema 2 makes the v0.7 fields mandatory; schema 1 files keep validating with a warning.
  const v2 = s.schema === 2
  if (s.initiative_type === UNCONFIRMED) {
    if (s.current_phase !== 0 || s.gates?.initiative_type !== 'pending') {
      f.push(err('E_TYPE', 'initiative_type: unconfirmed is only valid at current_phase 0 while gates.initiative_type is pending'))
    }
  } else if (!TYPES.includes(s.initiative_type)) f.push(err('E_TYPE', `initiative_type must be one of ${TYPES.join(', ')}, or unconfirmed at phase 0`))
  else if (!TYPE_PATHS[s.initiative_type].includes(s.path)) {
    f.push(err('E_PATH', `path ${s.path} does not match initiative_type ${s.initiative_type} (allowed: ${TYPE_PATHS[s.initiative_type].join(', ')})`))
  }
  if (!DEPTHS.includes(s.depth)) f.push(err('E_DEPTH', `depth must be one of ${DEPTHS.join(', ')}`))
  if (!Number.isInteger(s.current_phase) || s.current_phase < 0 || s.current_phase > 7) {
    f.push(err('E_PHASE', 'current_phase must be an integer 0-7'))
  }
  for (const k of ['started', 'last_updated']) {
    if (!isIsoDate(s[k])) f.push(err('E_DATE', `${k} must be an ISO date (YYYY-MM-DD)`))
  }

  if (typeof s.ai_feature !== 'boolean') f.push(err('E_BOOL', 'ai_feature must be true or false (lowercase)'))

  // gates
  const gates = s.gates || {}
  let gatesOk = true
  for (const g of GATES) {
    if (!(g in gates) || !GATE_STATUS.includes(gates[g])) {
      f.push(err('E_GATES', `gates.${g} must be one of ${GATE_STATUS.join(', ')}`)); gatesOk = false
    }
  }
  for (const g of Object.keys(gates)) if (!GATES.includes(g)) f.push(err('E_GATES', `unknown gate "${g}"`))
  const reasons = s.gate_reasons || {}
  if (gatesOk) {
    for (const g of GATES) {
      if ((gates[g] === 'skipped' || gates[g] === 'provisional') && empty(reasons[g])) {
        f.push(err('E_REASON', `gates.${g} is ${gates[g]} but gate_reasons.${g} is empty`))
      }
    }
    const required = PATH_GATES[s.path]
    if (required) {
      GATES.forEach((g, i) => {
        if (gates[g] === 'passed' && !required.includes(i)) {
          f.push(err('E_PATH_GATE', `gate ${i} (${g}) is not part of path ${s.path} and cannot be passed`))
        }
        if (gates[g] === 'passed') {
          for (const h of required) {
            if (h < i && !['passed', 'skipped', 'provisional'].includes(gates[GATES[h]])) {
              f.push(err('E_ORDER', `gate ${i} (${g}) is passed but required earlier gate ${h} (${GATES[h]}) is ${gates[GATES[h]]}`))
              break
            }
          }
        }
      })
      const lastPassed = Math.max(-1, ...GATES.map((g, i) => (gates[g] === 'passed' ? i : -1)))
      if (Number.isInteger(s.current_phase) && s.current_phase < lastPassed) {
        f.push(err('E_PHASE_BEHIND', `current_phase ${s.current_phase} is behind the last passed gate ${lastPassed}`))
      }
    }
  }

  // risks
  const risks = s.risks || {}
  const scored = []
  for (const k of [...RISK_KEYS, 'ai']) {
    const v = risks[k]
    if (empty(v)) continue
    // a model often writes "n/a" for the AI risk of a feature without a model: accept it, with a nudge
    if (k === 'ai' && s.ai_feature !== true && isNa(v)) {
      f.push(warn('W_RISK_NA', 'risks.ai is "n/a": leave it empty when ai_feature is false'))
      continue
    }
    if (!Number.isInteger(v) || v < 1 || v > 5) f.push(err('E_RISK', `risks.${k} must be an integer 1-5`))
    else scored.push([k, v])
  }
  if (!empty(risks.ai) && s.ai_feature !== true && !isNa(risks.ai)) f.push(err('E_RISK_AI', 'risks.ai is set but ai_feature is not true'))
  if (s.ai_feature === true && s.depth !== 'full') f.push(err('E_AI_DEPTH', 'features with a model (ai_feature: true) require depth: full'))
  const maxRisk = Math.max(0, ...scored.map(([, v]) => v))
  if (maxRisk >= 4 && s.depth !== 'full') f.push(err('E_DEPTH_UPGRADE', 'a risk >= 4 requires depth: full'))

  const passed = (g) => gates[g] === 'passed'
  const std = s.depth === 'standard' || s.depth === 'full'
  const spec = s.spec || {}
  const scope = s.scope || {}

  // status: a stopped initiative is a legitimate outcome, not an error
  const stopped = s.status === 'stopped'
  if (!empty(s.status) && !STATUSES.includes(s.status)) f.push(err('E_STATUS', `status must be one of ${STATUSES.join(', ')}`))
  if (stopped) {
    if (empty(s.stop_reason)) f.push(err('E_STOP', 'status: stopped needs stop_reason'))
    if (!isIsoDate(s.stopped_on)) f.push(err('E_STOP', 'status: stopped needs stopped_on (ISO date)'))
  }

  // stakeholder request intake (any schema, any path)
  const req = s.request
  if (req && !empty(req.origin) && !ORIGINS.includes(req.origin)) {
    f.push(err('E_REQUEST_ORIGIN', `request.origin must be one of ${ORIGINS.join(', ')}`))
  }
  if (passed('signals') && req?.origin === 'stakeholder') {
    const missing = ['underlying_need', 'minimal_slice', 'tradeoff', 'approver'].filter((k) => empty(req[k]))
    if (!isIsoDate(req.decided_on)) missing.push('decided_on (ISO date)')
    if (missing.length) f.push(err('E_G1_REQUEST', `Gate 1 passed on a stakeholder request but request.${missing.join(', request.')} is missing`))
  }

  // Gate 1
  if (passed('signals')) {
    if (empty(s.problem_statement?.summary)) f.push(err('E_G1_PROBLEM', 'Gate 1 passed but problem_statement.summary is empty'))
    if (v2 && empty(s.problem_statement?.cost_of_inaction)) {
      f.push(err('E_G1_INACTION', 'Gate 1 passed but problem_statement.cost_of_inaction is empty ("if we do not build this, what happens?")'))
    }
    if (std && v2) {
      const o = s.outcome || {}
      if (empty(o.metric) || empty(o.baseline) || empty(o.target)) {
        f.push(err('E_G1_OUTCOME', 'Gate 1 passed (standard/full) but outcome.metric, outcome.baseline and outcome.target must all be set'))
      }
    }
    if (std) {
      if (empty(s.hypothesis)) f.push(err('E_G1_HYPOTHESIS', 'Gate 1 passed (standard/full) but hypothesis is empty'))
      const need = s.ai_feature === true ? [...RISK_KEYS, 'ai'] : RISK_KEYS
      if (need.some((k) => empty(risks[k])) || empty(risks.highest)) {
        f.push(err('E_G1_RISKS', `Gate 1 passed (standard/full) but risks must be scored (${need.join(', ')}) and risks.highest set`))
      }
      if (maxRisk >= 4 && empty(risks.mitigation_plan)) f.push(err('E_G1_MITIGATION', 'a risk >= 4 needs risks.mitigation_plan'))
    }
  }

  // Gate 3
  if (passed('specification')) {
    if (empty(scope.in) || empty(scope.out)) f.push(err('E_G3_SCOPE', 'Gate 3 passed but scope.in and scope.out must both be non-empty'))
    if (std) {
      if (empty(scope.alternatives_considered)) f.push(err('E_G3_ALTERNATIVES', 'Gate 3 (standard/full) needs scope.alternatives_considered'))
      if (!CLASSES.includes(spec.implementation_class)) f.push(err('E_G3_CLASS', `spec.implementation_class must be one of ${CLASSES.join(', ')}`))
      if (empty(spec.adoption_threshold)) f.push(err('E_G3_ADOPTION', 'Gate 3 (standard/full) needs spec.adoption_threshold'))
    }
    const vu = Math.max(risks.value || 0, risks.usability || 0)
    if (!ASSUMPTION.includes(spec.riskiest_assumption)) {
      f.push(err('E_G3_ASSUMPTION', `spec.riskiest_assumption must be one of ${ASSUMPTION.join(', ')}`))
    } else if ((vu >= 4 || s.depth === 'full') && !['tested', 'accepted_untested'].includes(spec.riskiest_assumption)) {
      f.push(err('E_G3_ASSUMPTION', 'full depth, or value/usability risk >= 4: spec.riskiest_assumption must be tested or accepted_untested (not pending or not_required)'))
    }
  }
  // an AI feature cannot escape the eval gates by marking them provisional or skipped
  const closed = (g) => ['passed', 'provisional', 'skipped'].includes(gates[g])
  if (closed('specification') && s.ai_feature === true && !['approved', 'executed'].includes(s.eval_plan?.status)) {
    f.push(err('E_G3_EVAL', 'ai_feature: Gate 3 needs eval_plan.status approved or executed (it cannot be provisional or skipped)'))
  }
  if (s.eval_plan && !EVAL.includes(s.eval_plan.status)) f.push(err('E_EVAL', `eval_plan.status must be one of ${EVAL.join(', ')}`))

  // Gate 6
  const del = s.delivery || {}
  if (passed('delivery')) {
    if (!ROLLOUTS.includes(del.rollout) || del.rollout === 'not_set') f.push(err('E_G6_ROLLOUT', 'Gate 6 passed but delivery.rollout is not set'))
    if (!isIsoDate(del.delivery_date)) f.push(err('E_G6_DATE', 'Gate 6 passed but delivery.delivery_date is missing or not an ISO date'))
  }
  // v0.10: a beta needs a usage contract; a full-depth launch needs a feature roast (or a written reason)
  if (passed('delivery') && v2) {
    if (del.rollout === 'beta') {
      const b = s.beta || {}
      if (empty(b.minimum_usage) || !Number.isInteger(b.feedback_sessions) || b.feedback_sessions < 1) {
        f.push(err('E_G6_BETA', 'rollout beta: Gate 6 needs beta.minimum_usage (what usage makes the beta meaningful) and beta.feedback_sessions (an integer >= 1)'))
      }
    }
    if (s.depth === 'full') {
      const r = s.readiness?.roast
      if (!ROAST.includes(r) || r === 'not_run') f.push(err('E_G6_ROAST', 'full depth: Gate 6 needs readiness.roast set to done, or skipped with readiness.roast_note'))
      else if (r === 'skipped' && empty(s.readiness?.roast_note)) f.push(err('E_G6_ROAST_REASON', 'readiness.roast is skipped: record why in readiness.roast_note'))
    }
  }
  if (s.beta && !empty(s.beta.feedback_sessions) && (!Number.isInteger(s.beta.feedback_sessions) || s.beta.feedback_sessions < 0)) {
    f.push(err('E_BETA', 'beta.feedback_sessions must be a whole number >= 0'))
  }
  if (s.readiness && !empty(s.readiness.roast) && !ROAST.includes(s.readiness.roast)) f.push(err('E_ROAST', `readiness.roast must be one of ${ROAST.join(', ')}`))
  // speed to learning: when the hypothesis was formed and when the first real evidence arrived
  const lr = s.learning || {}
  for (const k of ['hypothesis_formed', 'first_evidence']) if (!empty(lr[k]) && !isIsoDate(lr[k])) f.push(err('E_LEARNING_DATE', `learning.${k} must be an ISO date`))
  if (isIsoDate(lr.hypothesis_formed) && isIsoDate(lr.first_evidence) && lr.first_evidence < lr.hypothesis_formed) {
    f.push(err('E_LEARNING_ORDER', 'learning.first_evidence cannot be earlier than learning.hypothesis_formed'))
  }
  if (closed('delivery') && s.ai_feature === true && s.eval_plan?.status !== 'executed') {
    f.push(err('E_G6_EVAL', 'ai_feature: Gate 6 needs eval_plan.status executed (it cannot be provisional or skipped)'))
  }

  // v0.11 Gate 4: stakeholders are not end users; the question must be answered (schema 2, when the block exists)
  const val = s.validation
  if (val && !empty(val.end_user_test) && !END_USER.includes(val.end_user_test)) {
    f.push(err('E_END_USER', `validation.end_user_test must be one of ${END_USER.join(', ')}`))
  }
  if (passed('prototyping') && v2) {
    if (!val) {
      f.push(warn('W_G4_VALIDATION', 'Gate 4 passed with no validation block: record whether the prototype was tested with end users who match the persona (validation.end_user_test)'))
    } else if (empty(val.end_user_test) || val.end_user_test === 'not_asked') {
      f.push(err('E_G4_END_USER', 'Gate 4 passed but validation.end_user_test is not answered (done, accepted_risk or not_applicable)'))
    } else if (val.end_user_test === 'accepted_risk' && empty(val.end_user_note)) {
      f.push(err('E_G4_END_USER_NOTE', 'validation.end_user_test is accepted_risk: record why in validation.end_user_note'))
    }
  }

  // v0.11 post-deploy: the real production date and the announcement
  if (!empty(del.deployed_on) && !isIsoDate(del.deployed_on)) f.push(err('E_DEPLOYED_DATE', 'delivery.deployed_on must be an ISO date (YYYY-MM-DD)'))
  if (!empty(del.deployed_on) && isIsoDate(del.deployed_on) && !passed('delivery')) {
    f.push(err('E_DEPLOYED_EARLY', 'delivery.deployed_on is set but Gate 6 has not passed: confirm the deploy after the launch go decision'))
  }
  if (!empty(del.announcement) && !ANNOUNCEMENT.includes(del.announcement)) f.push(err('E_ANNOUNCEMENT', `delivery.announcement must be one of ${ANNOUNCEMENT.join(', ')}`))
  if (del.announcement === 'skipped' && empty(del.announcement_note)) f.push(err('E_ANNOUNCEMENT_REASON', 'delivery.announcement is skipped: record why in delivery.announcement_note'))

  // Gate 7
  const m = s.measurement || {}
  const anchor = isIsoDate(del.deployed_on) ? del.deployed_on : del.delivery_date // the real deploy date wins over the plan
  if (passed('measurement')) {
    const cps = [m.checkpoint_1, m.checkpoint_2, m.checkpoint_3]
    const valid = cps.every((c) => isIsoDate(c)) && isIsoDate(anchor)
    const ascending = valid && cps[0] < cps[1] && cps[1] < cps[2] && (!anchor || cps[0] > anchor)
    if (!valid || !ascending) {
      f.push(err('E_G7_CHECKPOINTS', 'Gate 7 passed but measurement.checkpoint_1..3 must be ascending ISO dates after the deploy date (delivery.deployed_on, else delivery.delivery_date)'))
    } else {
      const def = [14, 30, 60].map((n) => addDays(anchor, n))
      const isDefault = cps.every((c, i) => c === def[i])
      if (!isDefault && empty(m.window_reason)) {
        f.push(err('E_G7_WINDOW', 'checkpoints differ from the 14/30/60-day defaults: record measurement.window_reason (if the deploy slipped, re-anchor them on delivery.deployed_on)'))
      }
    }
  }

  if (!empty(m.adoption_d30) && (typeof m.adoption_d30 !== 'number' || m.adoption_d30 < 0 || m.adoption_d30 > 100)) {
    f.push(err('E_ADOPTION', 'measurement.adoption_d30 must be a number from 0 to 100 (percent)'))
  }
  // Gate 7 closes when measurement is *configured*; the verdict is owed once the last checkpoint is checked.
  const checkedList = Array.isArray(m.checked) ? m.checked.map(Number) : []
  if (v2 && checkedList.includes(3)) {
    if (!VERDICTS.includes(m.verdict) || empty(m.verdict_reason)) {
      f.push(err('E_G7_VERDICT', `checkpoint 3 is checked but measurement.verdict (${VERDICTS.join(' | ')}) and measurement.verdict_reason are required`))
    }
  }

  // advisory (non-blocking)
  if (s.schema === 1) f.push(warn('W_SCHEMA_OLD', 'schema 1: the v0.7 fields (cost_of_inaction, outcome, verdict) are not enforced; migrate to schema 2'))
  if (s.spec?.agent_surface === 'defined' && s.depth !== 'full') {
    f.push(warn('W_AGENT_DEPTH', 'agent surface is defined: if any capability lets an agent write to the product, depth should be full'))
  }
  if (s.initiative_type === 'contractual' && s.depth !== 'full') {
    f.push(warn('W_CONTRACTUAL_DEPTH', 'contractual work is documented as full depth; record why a lighter depth is acceptable'))
  }
  if (!empty(s.hypothesis) && !passed('measurement') && passed('delivery') && !stopped) {
    f.push(warn('W_G7_PENDING', 'delivery is passed; measurement (Gate 7) is still open'))
  }
  return f
}

/** Checkpoints whose date has passed and that are not yet in measurement.checked. */
export function dueCheckpoints(s, today) {
  const m = s.measurement || {}
  const checked = Array.isArray(m.checked) ? m.checked : []
  const out = []
  for (const n of [1, 2, 3]) {
    const due = m[`checkpoint_${n}`]
    if (isIsoDate(due) && due <= today && !checked.map(Number).includes(n)) out.push({ n, due })
  }
  return out
}

/**
 * The planned delivery date when Gate 6 passed, that date has arrived and nobody has recorded when the
 * change really reached production (delivery.deployed_on); otherwise null. The checkpoints should start
 * from the real date, so the orchestrator asks "did it ship?" before anything else.
 */
export function deployUnconfirmed(s, today) {
  const del = s.delivery || {}
  if (s.status === 'stopped' || s.gates?.delivery !== 'passed') return null
  if (!isIsoDate(del.delivery_date) || isIsoDate(del.deployed_on)) return null
  return del.delivery_date <= today ? del.delivery_date : null
}
