#!/usr/bin/env node
/**
 * Open application routes and write a machine-readable visual report.
 *
 *   FRAPPE_USER=... FRAPPE_PASSWORD=... node scripts/verify-ui.mjs app-verify.json
 *
 * Spec:
 *   {
 *     "base": "http://127.0.0.1:8000",
 *     "login": true,
 *     "out": "qa/visual",
 *     "viewports": [{ "width": 1440, "height": 900 }, { "width": 1280, "height": 800 }, { "width": 390, "height": 844 }],
 *     "pages": [{
 *       "name": "projects",
 *       "path": "/desk/app/cojira-project",
 *       "checks": [{ "name": "page head", "selector": ".page-head", "expect": { "h": 49 }, "tol": 1 }]
 *     }]
 *   }
 *
 * A missing selector fails the run. This script does not claim a pass when Chrome
 * cannot start: it writes status "not-run" and exits 2.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveCredentials } from './credentials.mjs'
import { checkExpect, summarise } from './report.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const specPath = path.resolve(process.cwd(), process.argv[2] || '')
if (!process.argv[2]) {
  console.error('usage: node scripts/verify-ui.mjs <spec.json>')
  process.exit(2)
}
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'))
const out = path.resolve(process.cwd(), spec.out || 'qa/visual')
fs.mkdirSync(out, { recursive: true })

const DEFAULT_VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 390, height: 844 },
]
const viewports = spec.viewports?.length ? spec.viewports : DEFAULT_VIEWPORTS

function writeNotRun(reason) {
  const report = {
    status: 'not-run',
    visual: false,
    reason,
    generatedAt: new Date().toISOString(),
    spec: path.relative(process.cwd(), specPath),
    viewports: viewports.map(({ width, height }) => ({ width, height })),
    pages: [],
  }
  const reportPath = path.join(out, 'verify-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.error(reason)
  console.error(`Report: ${path.relative(process.cwd(), reportPath)}`)
  process.exit(2)
}

let credentials = null
try {
  credentials = resolveCredentials(spec.login)
} catch (error) {
  writeNotRun(error.message)
}

let browser
try {
  const { launch } = await import('./browser.mjs')
  browser = await launch()
} catch (error) {
  writeNotRun(`Browser did not start, so no page was rendered. ${error.message}`)
}

const page = await browser.newPage()
page.setDefaultTimeout(20000)
if (credentials) {
  await page.goto(`${spec.base}/login`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('#login_email')
  await page.type('#login_email', credentials.user)
  await page.type('#login_password', credentials.password)
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}),
    page.click('form.form-login button[type="submit"]'),
  ])
}

const pages = []
for (const viewport of viewports) {
  const label = `${viewport.width}x${viewport.height}`
  await page.setViewport({ width: viewport.width, height: viewport.height, isMobile: viewport.width < 768 })
  for (const item of spec.pages || []) {
    console.error(`rendering ${item.name} at ${label}`)
    await page.goto(spec.base + item.path, { waitUntil: 'domcontentloaded' })
    await new Promise((resolve) => setTimeout(resolve, item.wait ?? 1200))
    const shot = path.join(out, `${item.name}-${label}.png`)
    await page.screenshot({ path: shot })
    const rows = []
    for (const check of item.checks || []) {
      const measured = await page.evaluate((selector) => {
        const el = document.querySelector(selector)
        if (!el) return null
        const rect = el.getBoundingClientRect()
        const style = getComputedStyle(el)
        return {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          w: Math.round(rect.width),
          h: Math.round(rect.height),
          'font-size': style.fontSize,
          'font-weight': style.fontWeight,
          'padding-top': style.paddingTop,
          'padding-right': style.paddingRight,
          'padding-bottom': style.paddingBottom,
          'padding-left': style.paddingLeft,
          color: style.color,
          'background-color': style.backgroundColor,
          'border-radius': style.borderRadius,
        }
      }, check.selector)
      const result = checkExpect(measured, check.expect || {}, check.tol ?? 1)
      rows.push({ name: check.name, selector: check.selector, ok: result.ok, deltas: result.deltas })
    }
    // A page with no checks still has to render. Record that the document opened.
    if (!item.checks?.length) {
      const opened = await page.evaluate(() => document.body != null)
      rows.push({ name: 'document', selector: 'body', ok: opened, deltas: opened ? [] : [{ prop: 'element', expected: 'present', actual: 'missing' }] })
    }
    pages.push({ name: item.name, viewport: { width: viewport.width, height: viewport.height }, url: page.url(), rows })
  }
}
await browser.close()

const summary = summarise(pages)
const report = {
  ...summary,
  visual: true,
  generatedAt: new Date().toISOString(),
  spec: path.relative(process.cwd(), specPath),
  viewports: viewports.map(({ width, height }) => ({ width, height })),
  pages,
}
const reportPath = path.join(out, 'verify-report.json')
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
console.log(`${summary.status}: ${summary.failureCount} check(s) failed. Report: ${path.relative(process.cwd(), reportPath)}`)
process.exit(summary.status === 'pass' ? 0 : 1)
