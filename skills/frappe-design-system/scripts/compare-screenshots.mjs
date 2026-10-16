#!/usr/bin/env node
/**
 * Compare example geometry with the Desk measurements.
 * A pixel diff is not a pass. This checks the boxes that define the shell.
 *
 *   node scripts/compare-screenshots.mjs
 *
 * Reads references/visual-audit/list-user-1440x900.json (runtime Desk)
 * and tests/visual/example-geometry.json (written by the geometry test).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const deskPath = path.join(root, 'references/visual-audit/list-user-1440x900.json')
const examplePath = path.join(root, 'tests/visual/example-geometry.json')

if (!fs.existsSync(examplePath)) {
  console.error('missing example geometry. Run: node tests/visual/geometry.test.mjs')
  process.exit(1)
}

const desk = JSON.parse(fs.readFileSync(deskPath, 'utf8'))
const examples = JSON.parse(fs.readFileSync(examplePath, 'utf8'))
const report = []

function row(name, expected, actual, note) {
  const ok = actual === expected
  report.push({ name, expected, actual, ok, note: note || '' })
}

const shell = examples['standalone-frontend']
row('example sidebar width', 224, shell.sidebar, 'Desk token, both versions')
row('example header height', 48, shell.header, 'border is extra on Desk; the example uses the token')
row('example dock outer width', 57, shell.dock, '56px + 1px border, both versions')
row('example v16.50 tile', 40, shell.tile, 'design target')

row('desk sidebar width', 224, desk.nodes?.sidebar?.w ?? desk.sidebar?.w, 'measured v16.52')
row('desk dock outer width', 57, desk.nodes?.dock?.w ?? desk.dock?.w, 'measured v16.52')
row('desk dock tile token', '34px', desk.tokens['--dock-tile'], 'runtime. Examples intentionally stay at 40px')
row('desk page head border box', 49, desk.nodes?.pageHead?.h ?? desk.pageHead?.h, '48px token + 1px border')

const detail = examples['detail-view']
row('detail panel width', 277, detail.panel, 'form sidebar token')

const failed = report.filter((item) => !item.ok)
const out = path.join(root, 'references/visual-audit/comparison.json')
fs.writeFileSync(out, JSON.stringify({ generatedFrom: 'compare-screenshots.mjs', report }, null, 2))

for (const item of report) {
  console.log(`${item.ok ? 'ok' : 'FAIL'}  ${item.name}: expected ${item.expected}, got ${item.actual}`)
}
console.log(`known delta: example dock tile 40px (v16.50 target) vs Desk token ${desk.tokens['--dock-tile']} (v16.52 runtime)`)
if (failed.length) process.exit(1)
