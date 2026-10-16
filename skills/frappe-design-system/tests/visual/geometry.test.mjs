/**
 * Open the three examples in Chrome and measure the shell.
 * Writes tests/visual/example-geometry.json for compare-screenshots.mjs.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { launch } from '../../scripts/browser.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const browser = await launch()

async function measure(name) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  const file = path.join(root, 'examples', name, 'index.html')
  await page.goto(pathToFileURL(file).href, { waitUntil: 'load' })
  const box = await page.evaluate(() => {
    const size = (sel) => {
      const el = document.querySelector(sel)
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { w: Math.round(r.width), h: Math.round(r.height) }
    }
    return {
      dock: size('.dock')?.w ?? null,
      tile: size('.dock-tile')?.w ?? null,
      sidebar: size('.sidebar')?.w ?? null,
      header: size('.page-head')?.h ?? null,
      panel: size('.panel')?.w ?? null,
      avatar: size('.avatar-tile')?.w ?? null,
      tabs: size('.tabs')?.h ?? null,
      modal: size('.modal')?.w ?? null,
      row: size('table.data td')?.h ?? null,
      metricPad: (() => {
        const el = document.querySelector('.metric')
        return el ? getComputedStyle(el).padding : null
      })(),
      font: getComputedStyle(document.body).fontFamily,
    }
  })
  const shot = path.join(root, 'assets/screenshots', `example-${name}-1440x900.png`)
  await page.screenshot({ path: shot })
  await page.close()
  return box
}

const names = ['dashboard', 'detail-view', 'standalone-frontend', 'right-panel', 'record-form', 'modal']
const result = {}
for (const name of names) result[name] = await measure(name)
await browser.close()

const out = path.join(root, 'tests/visual/example-geometry.json')
fs.writeFileSync(out, JSON.stringify(result, null, 2))
console.log(JSON.stringify(result, null, 2))

const shell = result['standalone-frontend']
const problems = []
if (shell.sidebar !== 224) problems.push(`sidebar ${shell.sidebar}`)
if (shell.header !== 48) problems.push(`header ${shell.header}`)
if (shell.dock !== 57) problems.push(`dock ${shell.dock}`)
if (shell.tile !== 40) problems.push(`tile ${shell.tile}`)
if (result['detail-view'].panel !== 277) problems.push(`panel ${result['detail-view'].panel}`)
if (result['right-panel'].panel !== 277) problems.push(`right panel ${result['right-panel'].panel}`)
if (result.dashboard.metricPad !== '8px 8px 8px 12px') problems.push(`metric padding ${result.dashboard.metricPad}`)
if (result['record-form'].panel !== 277) problems.push(`record panel ${result['record-form'].panel}`)
if (result['record-form'].avatar !== 80) problems.push(`avatar ${result['record-form'].avatar}`)
if (result['record-form'].tabs !== 42) problems.push(`tabs ${result['record-form'].tabs}`)
if (result['record-form'].header !== 48) problems.push(`record header ${result['record-form'].header}`)
if (result.modal.modal !== 575) problems.push(`modal ${result.modal.modal}`)
if (result['detail-view'].row !== 41) problems.push(`data row ${result['detail-view'].row}`)
if (!String(result.dashboard.font).includes('InterVariable')) problems.push(`font ${result.dashboard.font}`)
if (problems.length) {
  console.error(problems.join('\n'))
  process.exit(1)
}
console.log('geometry ok')
