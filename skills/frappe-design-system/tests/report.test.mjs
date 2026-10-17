import assert from 'node:assert/strict'
import { comparePair, checkExpect, summarise } from '../scripts/report.mjs'

const missing = comparePair({
  ref: { h: 49 },
  cand: null,
  props: ['h'],
})
assert.equal(missing.ok, false)
assert.equal(missing.blocking[0].prop, 'element')
assert.equal(missing.blocking[0].cand, 'missing')

const within = comparePair({
  ref: { h: 49, 'font-size': '16px' },
  cand: { h: 50, 'font-size': '16px' },
  props: ['h', 'font-size'],
  tol: 1,
})
assert.equal(within.ok, true)

const accepted = comparePair({
  ref: { w: 40 },
  cand: { w: 34 },
  props: ['w'],
  accept: ['w'],
})
assert.equal(accepted.ok, true)
assert.equal(accepted.deltas.length, 1)

const expectMiss = checkExpect(null, { h: 49 })
assert.equal(expectMiss.ok, false)

const expectOk = checkExpect({ h: 48, 'font-size': '14px' }, { h: 49, 'font-size': '14px' }, 1)
assert.equal(expectOk.ok, true)

const summary = summarise([
  { name: 'projects', viewport: { width: 1440, height: 900 }, rows: [{ name: 'page head', ok: false }] },
])
assert.equal(summary.status, 'fail')
assert.equal(summary.failures[0].check, 'page head')

const clean = summarise([{ name: 'projects', rows: [{ name: 'page head', ok: true }] }])
assert.equal(clean.status, 'pass')

console.log('report ok')
