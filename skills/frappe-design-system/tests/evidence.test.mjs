import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { assessEvidence } from '../scripts/evidence.mjs'

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fds-evidence-'))
const source = path.join(dir, 'Page.vue')
const shot = path.join(dir, 'page-1440x900.png')
const report = path.join(dir, 'verify-report.json')
fs.writeFileSync(source, '<template></template>')
fs.writeFileSync(shot, 'png')
fs.writeFileSync(
  report,
  JSON.stringify({
    status: 'pass',
    visual: true,
    viewports: [
      { width: 1440, height: 900 },
      { width: 1280, height: 800 },
      { width: 390, height: 844 },
    ],
  }),
)
const now = Date.now()
fs.utimesSync(shot, now / 1000, now / 1000)
fs.utimesSync(report, now / 1000, now / 1000)
fs.utimesSync(source, (now - 5000) / 1000, (now - 5000) / 1000)

const current = assessEvidence({ sources: [source], shots: [shot], reportPath: report })
assert.equal(current.ok, true, current.problems.join('; '))

const missing = assessEvidence({ sources: [source], shots: [path.join(dir, 'nope.png')], reportPath: report })
assert.equal(missing.ok, false)
assert.ok(missing.problems.some((line) => line.startsWith('missing')))

fs.utimesSync(source, (now + 10_000) / 1000, (now + 10_000) / 1000)
const stale = assessEvidence({ sources: [source], shots: [shot], reportPath: report })
assert.equal(stale.ok, false)
assert.ok(stale.problems.some((line) => line.startsWith('stale')))

fs.writeFileSync(report, JSON.stringify({ status: 'pass', visual: false, viewports: [] }))
fs.utimesSync(report, (now + 20_000) / 1000, (now + 20_000) / 1000)
fs.utimesSync(shot, (now + 20_000) / 1000, (now + 20_000) / 1000)
const notVisual = assessEvidence({ sources: [source], shots: [shot], reportPath: report })
assert.equal(notVisual.ok, false)
assert.ok(notVisual.problems.some((line) => line.includes('browser was not opened')))

console.log('evidence ok')
