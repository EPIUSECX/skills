/**
 * QA evidence is stale when a screenshot or report is older than the UI it claims to cover,
 * or when a required viewport is absent from the report.
 */
import fs from 'node:fs'
import path from 'node:path'

const REQUIRED_VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 390, height: 844 },
]

function walk(dir, out) {
  if (!fs.existsSync(dir)) return out
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue
    const next = path.join(dir, name)
    const stat = fs.statSync(next)
    if (stat.isDirectory()) walk(next, out)
    else out.push({ file: next, mtimeMs: stat.mtimeMs })
  }
  return out
}

export function newestMtime(paths) {
  let newest = 0
  for (const entry of paths) {
    const full = path.resolve(entry)
    if (!fs.existsSync(full)) continue
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      for (const file of walk(full, [])) newest = Math.max(newest, file.mtimeMs)
    } else newest = Math.max(newest, stat.mtimeMs)
  }
  return newest
}

export function assessEvidence({ sources = [], shots = [], reportPath, requiredViewports = REQUIRED_VIEWPORTS }) {
  const missing = []
  const stale = []
  const sourceStamp = newestMtime(sources)
  for (const shot of shots) {
    if (!fs.existsSync(shot)) missing.push(shot)
    else if (sourceStamp && fs.statSync(shot).mtimeMs + 1000 < sourceStamp) stale.push(shot)
  }
  let report = null
  let reportProblems = []
  if (!reportPath || !fs.existsSync(reportPath)) {
    missing.push(reportPath || 'verify-report.json')
  } else {
    if (sourceStamp && fs.statSync(reportPath).mtimeMs + 1000 < sourceStamp) stale.push(reportPath)
    try {
      report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
    } catch {
      reportProblems.push('report is not JSON')
    }
    if (report) {
      if (report.status !== 'pass') reportProblems.push(`report status is ${report.status || 'missing'}`)
      if (report.visual === false) reportProblems.push('report says the browser was not opened')
      const seen = new Set((report.viewports || []).map((v) => `${v.width}x${v.height}`))
      for (const viewport of requiredViewports) {
        const key = `${viewport.width}x${viewport.height}`
        if (!seen.has(key)) reportProblems.push(`missing viewport ${key}`)
      }
    }
  }
  const problems = [
    ...missing.map((file) => `missing ${file}`),
    ...stale.map((file) => `stale ${file}`),
    ...reportProblems,
  ]
  return { ok: problems.length === 0, problems, missing, stale, reportProblems }
}
