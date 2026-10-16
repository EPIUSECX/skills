#!/usr/bin/env node
/**
 * Flag values that measured Desk v16.50 never uses. Every rule cites a measured value in
 * references/measured-desk.md; a hit is a prompt to check, not proof of a bug.
 *
 *   node scripts/check-design-consistency.mjs                 # the skill's own examples and templates
 *   node scripts/check-design-consistency.mjs src/ App.vue    # your files (paths relative to cwd)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const entries = args.length
  ? args.map((a) => path.resolve(process.cwd(), a))
  : ['examples', 'assets/templates', 'tokens/variables.css'].map((e) => path.join(root, e))
const skipDirs = new Set(['node_modules', 'dist', '.git', 'out'])

const rules = [
  { re: /padding:\s*24px/, msg: '24px padding is not a Desk step (page gutter 15px, card 12px 16px)' },
  { re: /font-size:\s*15px/, msg: '15px is not an Espresso size (12/13/14/16/17/20)' },
  { re: /border-radius:\s*16px|\brounded-2xl\b/, msg: 'Desk cards and dialogs use 12px (--radius-xl); controls 8px' },
  { re: /width:\s*15rem|width="15rem"|\bw-60\b/, msg: 'Frappe UI Sidebar defaults to 240px; Desk is 224px' },
  { re: /width:\s*22rem/, msg: 'Desk form sidebar / detail panel is 277px' },
  { re: /\b(bg|text|border)-(green|red|amber|yellow|orange|blue|gray)-(50|100|200|300|400|500|600|700|800|900)\b/, msg: 'raw Tailwind palette; use surface-{c}-2 / ink-{c}-8 / outline-gray-* semantic classes' },
  { re: /<svg(?![^>]*\bclass="[^"]*\bicon\b)[^>]*>\s*<(path|circle|rect|line|polyline)\b/, msg: 'inline hand-drawn SVG; use the Lucide sprite (<use href="…#name">) or Frappe UI lucide-* icons', ext: /\.(html|vue)$/ },
  { re: /font-family:\s*["']?Inter["']?\s*[,;]/, msg: 'Desk loads InterVariable (Inter 4); "Inter" first falls back to a different face' },
  { re: /#000000\b|#000\b|rgb\(0,\s*0,\s*0\)/, msg: 'pure black is not a Desk ink; text is ink-gray-6..9 (#525252..#0f0f0f)', ext: /\.(css|vue|html)$/ },
]

function walk(full, out) {
  if (!fs.existsSync(full)) {
    console.error(`not found: ${full}`)
    process.exitCode = 2
    return out
  }
  if (fs.statSync(full).isFile()) return out.push(full), out
  for (const name of fs.readdirSync(full)) {
    if (skipDirs.has(name)) continue
    const next = path.join(full, name)
    if (fs.statSync(next).isDirectory()) walk(next, out)
    else if (/\.(css|scss|html|vue|js|jsx|ts|tsx)$/.test(name)) out.push(next)
  }
  return out
}

const hits = []
for (const entry of entries) {
  for (const file of walk(entry, [])) {
    const lines = fs.readFileSync(file, 'utf8').split('\n')
    lines.forEach((line, i) => {
      for (const rule of rules) {
        if (rule.ext && !rule.ext.test(file)) continue
        if (rule.re.test(line)) hits.push(`${path.relative(process.cwd(), file)}:${i + 1}: ${rule.msg}`)
      }
    })
  }
}

if (hits.length) {
  console.error(hits.join('\n'))
  process.exit(1)
}
if (!process.exitCode) console.log('consistency ok')
