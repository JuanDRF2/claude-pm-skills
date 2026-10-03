// Locate Signal to Ship state files (00-signal-to-ship-state.md) near a directory.
import { readdirSync, statSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'

export const STATE_NAME = '00-signal-to-ship-state.md'
const SKIP = new Set(['node_modules', '.git', '.claude'])

/** Walk UP from a file or directory looking for the nearest state file. */
export function findStateUp(start, maxLevels = 5) {
  let dir = resolve(start)
  try { if (!statSync(dir).isDirectory()) dir = dirname(dir) } catch { dir = dirname(dir) }
  for (let i = 0; i < maxLevels; i++) {
    const candidate = join(dir, STATE_NAME)
    if (existsSync(candidate)) return candidate
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

/** Walk DOWN from a directory collecting every state file (bounded depth). */
export function findStatesDown(start, maxDepth = 4) {
  const out = []
  function walk(dir, depth) {
    if (depth > maxDepth) return
    let entries
    try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return }
    for (const e of entries) {
      if (e.isFile() && e.name === STATE_NAME) out.push(join(dir, e.name))
      else if (e.isDirectory() && !SKIP.has(e.name)) walk(join(dir, e.name), depth + 1)
    }
  }
  walk(resolve(start), 0)
  return out
}
