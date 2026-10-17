#!/usr/bin/env node
/**
 * Fail when visual QA evidence is missing or older than the UI it covers.
 *
 *   node scripts/check-evidence.mjs .cursor/frappe-design-qa.json
 *
 * Manifest:
 *   { "sources": ["desk_ui/src"], "shots": ["qa/visual/page-1440x900.png"], "report": "qa/visual/verify-report.json" }
 *
 * No manifest: exit 0. The check applies only after an app opts in.
 */
import fs from 'node:fs'
import path from 'node:path'
import { assessEvidence } from './evidence.mjs'

const manifestPath = path.resolve(process.cwd(), process.argv[2] || '.cursor/frappe-design-qa.json')
if (!fs.existsSync(manifestPath)) {
  console.log(`no QA manifest at ${path.relative(process.cwd(), manifestPath)}; visual evidence check skipped`)
  process.exit(0)
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const base = path.dirname(manifestPath)
const resolve = (file) => (path.isAbsolute(file) ? file : path.resolve(process.cwd(), file))
const result = assessEvidence({
  sources: (manifest.sources || []).map(resolve),
  shots: (manifest.shots || []).map(resolve),
  reportPath: manifest.report ? resolve(manifest.report) : '',
  requiredViewports: manifest.viewports,
})
if (result.ok) {
  console.log('QA evidence is current')
  process.exit(0)
}
console.error(result.problems.join('\n'))
console.error(`manifest: ${path.relative(process.cwd(), manifestPath)} (base ${base})`)
process.exit(1)
