/**
 * Render every static example and check the shell against Desk numbers measured on a
 * v16.5x bench (references/measured-desk.md). No Desk needed; for live parity run
 * scripts/compare-pages.mjs. Also fails when an icon reference does not resolve: the
 * box of a broken <use> still measures 16px, so geometry alone cannot see it.
 *
 * Examples are served over HTTP because Chrome refuses external <use href> on file://.
 * Writes assets/screenshots/example-<name>-1440x900.png and tests/visual/example-geometry.json.
 */
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { launch } from '../../scripts/browser.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const types = { '.html': 'text/html', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.js': 'text/javascript' }
const server = http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname))
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return res.writeHead(404).end()
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${server.address().port}`

const browser = await launch()

async function measure(name) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto(`${base}/examples/${name}/index.html`, { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  const box = await page.evaluate(async () => {
    const rect = (sel) => document.querySelector(sel)?.getBoundingClientRect() ?? null
    const w = (sel) => (rect(sel) ? Math.round(rect(sel).width) : null)
    const h = (sel) => (rect(sel) ? Math.round(rect(sel).height) : null)
    const css = (sel, p) => (document.querySelector(sel) ? getComputedStyle(document.querySelector(sel)).getPropertyValue(p) : null)
    const missingIcons = []
    const sprites = {}
    for (const use of document.querySelectorAll('use')) {
      const [file, id] = use.getAttribute('href').split('#')
      const url = new URL(file, location.href).href
      sprites[url] ||= fetch(url).then((r) => r.text()).then((t) => new DOMParser().parseFromString(t, 'image/svg+xml'))
      const doc = await sprites[url]
      const sym = doc.querySelector('parsererror') ? null : doc.getElementById(id)
      if (!sym || sym.tagName !== 'symbol' || sym.querySelector('svg')) missingIcons.push(id)
    }
    return {
      dock: w('.dock'),
      tile: w('.dock-items .dock-tile'),
      sidebar: w('.sidebar'),
      navRow: h('.nav-item'),
      header: h('.page-head'),
      panel: w('.panel'),
      listHead: h('.list-head'),
      listRow: h('.list-row'),
      tabs: h('.tabs'),
      modal: w('.modal'),
      button: h('.es-btn'),
      input: h('.search, .input'),
      cardPad: css('.number-card', 'padding'),
      cardRadius: css('.number-card', 'border-radius'),
      font: document.fonts.check('14px InterVariable') ? css('body', 'font-family').split(',')[0] : 'InterVariable not loaded',
      missingIcons,
    }
  })
  await page.screenshot({ path: path.join(root, 'assets/screenshots', `example-${name}-1440x900.png`) })
  await page.close()
  return box
}

const names = fs.readdirSync(path.join(root, 'examples')).filter((n) => fs.existsSync(path.join(root, 'examples', n, 'index.html')) && n !== 'standalone-vue')
const result = {}
for (const name of names) result[name] = await measure(name)
await browser.close()
server.close()

fs.writeFileSync(path.join(root, 'tests/visual/example-geometry.json'), JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify(result, null, 2))

// Desk v16.50 values; null means "element not on this page".
const expect = { dock: 57, tile: 40, sidebar: 224, navRow: 28, header: 49, panel: 277, listHead: 30, listRow: 41, tabs: 42, modal: 575, button: 28, input: 28, cardPad: '12px 16px', cardRadius: '12px' }
const problems = []
for (const [name, got] of Object.entries(result)) {
  for (const [key, want] of Object.entries(expect)) {
    if (got[key] !== null && got[key] !== want) problems.push(`${name}: ${key} ${got[key]} (want ${want})`)
  }
  if (got.font !== 'InterVariable') problems.push(`${name}: font ${got.font}`)
  if (got.missingIcons.length) problems.push(`${name}: unresolved icons ${[...new Set(got.missingIcons)].join(', ')}`)
}
if (problems.length) {
  console.error(problems.join('\n'))
  process.exit(1)
}
console.log(`geometry ok (${names.length} examples)`)
