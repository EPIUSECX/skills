#!/usr/bin/env node
/**
 * Measure a running Frappe Desk and write JSON plus PNG files.
 *
 *   node scripts/audit-ui.mjs --base http://127.0.0.1:8000 --out references/visual-audit
 *
 * Requires puppeteer-core on NODE_PATH and Chrome. Does not change site data
 * beyond a normal Administrator login.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, i, all) => {
    if (arg.startsWith('--')) pairs.push([arg.slice(2), all[i + 1]])
    return pairs
  }, []),
)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const base = args.base || 'http://127.0.0.1:8000'
const out = path.resolve(root, args.out || 'references/visual-audit')
fs.mkdirSync(out, { recursive: true })

const { launch } = await import('./browser.mjs')
const browser = await launch()
const page = await browser.newPage()
page.setDefaultTimeout(20000)

await page.goto(`${base}/login`, { waitUntil: 'domcontentloaded' })
await page.waitForSelector('#login_email')
await page.type('#login_email', process.env.FRAPPE_USER || 'Administrator')
await page.type('#login_password', process.env.FRAPPE_PASSWORD || 'admin')
await Promise.all([
  page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}),
  page.click('form.form-login button[type="submit"]'),
])

async function capture(name, viewport, url) {
  await page.setViewport(viewport)
  if (url) await page.goto(url, { waitUntil: 'domcontentloaded' })
  await new Promise((r) => setTimeout(r, 800))
  const measured = await page.evaluate(() => {
    const read = (sel) => {
      const el = document.querySelector(sel)
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { selector: sel, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
    }
    const style = getComputedStyle(document.documentElement)
    const names = ['--sidebar-width', '--dock-width', '--dock-tile', '--page-head-height', '--spacing', '--text-base', '--form-sidebar-width']
    const tokens = {}
    for (const name of names) tokens[name] = style.getPropertyValue(name).trim()
    return {
      url: location.href,
      title: document.title,
      vw: innerWidth,
      vh: innerHeight,
      tokens,
      sidebar: read('.body-sidebar'),
      dock: read('.dock'),
      pageHead: read('.page-head'),
      formSidebar: read('.form-sidebar'),
    }
  })
  const png = path.join(out, `${name}.png`)
  await page.screenshot({ path: png })
  fs.writeFileSync(path.join(out, `${name}.json`), JSON.stringify(measured, null, 2))
  console.log(name, measured.url, measured.tokens['--dock-tile'])
}

const desktop = { width: 1440, height: 900 }
await capture('desktop-1440x900', desktop, `${base}/desk`)
await capture('desktop-1280x800', { width: 1280, height: 800 })
await capture('desktop-1920x1080', { width: 1920, height: 1080 })
await capture('desktop-390x844', { width: 390, height: 844, isMobile: true })
await capture('list-user-1440x900', desktop, `${base}/desk/users/user?enabled=1`)
await capture('form-user-1440x900', desktop, `${base}/desk/users/user/Administrator`)
await browser.close()
console.log('wrote', out)
