/**
 * Turn measured boxes into a pass/fail report. Missing elements are failures.
 * Numeric props use `tol` (default 1px). Everything else must match exactly.
 * `accept` names props that are recorded and do not fail the pair.
 */

export function comparePair({ ref, cand, props, tol = 1, accept = [] }) {
  const deltas = []
  if (!ref || !cand) {
    deltas.push({
      prop: 'element',
      ref: ref ? 'found' : 'missing',
      cand: cand ? 'found' : 'missing',
    })
  } else {
    for (const prop of props) {
      const av = ref[prop]
      const bv = cand[prop]
      const numeric = typeof av === 'number' && typeof bv === 'number'
      const ok = numeric ? Math.abs(av - bv) <= tol : av === bv
      if (!ok) deltas.push({ prop, ref: av, cand: bv })
    }
  }
  const blocking = deltas.filter((delta) => !accept.includes(delta.prop))
  return { ok: blocking.length === 0, deltas, blocking }
}

/** Absolute checks against one rendered page. A missing selector fails. */
export function checkExpect(measured, expect, tol = 1) {
  if (!measured) {
    return { ok: false, deltas: [{ prop: 'element', expected: 'present', actual: 'missing' }] }
  }
  const deltas = []
  for (const [prop, expected] of Object.entries(expect || {})) {
    const actual = measured[prop]
    const numeric = typeof expected === 'number' && typeof actual === 'number'
    const ok = numeric ? Math.abs(actual - expected) <= tol : actual === expected
    if (!ok) deltas.push({ prop, expected, actual: actual ?? null })
  }
  return { ok: deltas.length === 0, deltas }
}

export function summarise(pages) {
  const failures = []
  for (const page of pages) {
    for (const row of page.rows || []) {
      if (!row.ok) failures.push({ page: page.name, viewport: page.viewport, check: row.name })
    }
  }
  return {
    status: failures.length ? 'fail' : 'pass',
    failureCount: failures.length,
    failures,
  }
}
