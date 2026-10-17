#!/usr/bin/env node
/**
 * Measure the same elements on a reference page (usually Desk) and a candidate page, then
 * report every computed-style and geometry delta. Also writes a side-by-side PNG and a
 * pixel-diff PNG for review. Geometry and style decide pass/fail; the pixel number is
 * context only, because demo data and icons differ.
 *
 *   node scripts/compare-pages.mjs tests/visual/parity-users.json
 *
 * Spec: { reference: { base, login }, candidate: { base }, viewport, out,
 *         pages: [{ name, ref, cand, wait?, pairs: [{ name, ref, cand, props?, tol? }] }] }
 * `ref` / `cand` in a pair are CSS selectors. `props` defaults to DEFAULT_PROPS.
 * Env: FRAPPE_USER and FRAPPE_PASSWORD when the reference logs in. No default password.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { launch } from './browser.mjs'
import { resolveCredentials } from './credentials.mjs'
import { comparePair } from './report.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const specPath = path.resolve(process.cwd(), process.argv[2] || 'tests/visual/parity-users.json')
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'))
const out = path.resolve(root, spec.out || 'tests/visual/out')
fs.mkdirSync(out, { recursive: true })

const DEFAULT_PROPS = ['x', 'y', 'w', 'h', 'font-size', 'font-weight', 'line-height', 'color', 'background-color', 'border-radius']
const viewport = spec.viewport || { width: 1440, height: 900 }

const browser = await launch()
const refPage = await browser.newPage()
const candPage = await browser.newPage()
await refPage.setViewport(viewport)
await candPage.setViewport(viewport)

if (spec.reference.login) {
  const credentials = resolveCredentials(spec.reference.login)
  await refPage.bringToFront()
  await refPage.goto(`${spec.reference.base}/login`, { waitUntil: 'domcontentloaded' })
  await refPage.waitForSelector('#login_email')
  await refPage.type('#login_email', credentials.user)
  await refPage.type('#login_password', credentials.password)
  await Promise.all([
    refPage.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}),
    refPage.click('form.form-login button[type="submit"]'),
  ])
}

function measure(selector, props) {
  const el = document.querySelector(selector)
  if (!el) return null
  const r = el.getBoundingClientRect()
  const cs = getComputedStyle(el)
  const box = { x: r.x, y: r.y, w: r.width, h: r.height }
  // Frappe UI writes oklch() and color(srgb ...); Desk writes rgb(). Paint each colour to one
  // pixel and read it back so both sides compare as 8-bit sRGB.
  const ctx = (window.__ctx ||= Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext('2d', { willReadFrequently: true }))
  const toRgb = (c) => {
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = '#000'
    ctx.fillStyle = c
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
    return a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${Math.round((a / 255) * 100) / 100})`
  }
  const colourRe = /(rgba?\([^)]*\)|oklch\([^)]*\)|color\([^)]*\)|#[0-9a-f]{3,8}\b)/gi
  const normalise = (p, v) => {
    if (p === 'box-shadow' && v !== 'none') {
      const layers = v.split(/,(?![^(]*\))/).map((s) => s.trim()).filter((s) => !/^rgba\(0, 0, 0, 0\)|^transparent/.test(s))
      v = layers.join(', ') || 'none'
    }
    return v.replace(colourRe, (m) => toRgb(m))
  }
  const res = {}
  for (const p of props) {
    if (p in box) res[p] = Math.round(box[p] * 10) / 10
    else if (p === 'icon') res[p] = el.querySelector('svg, [class*="lucide-"]')?.getBoundingClientRect().width ?? null
    else if (p === 'font-family') {
      // The first family decides the face when it is loaded; fallback lists legitimately differ.
      const first = cs.fontFamily.split(',')[0].trim().replace(/["']/g, '')
      res[p] = `${first}${document.fonts.check(`14px "${first}"`) ? '' : ' (not loaded)'}`
    } else res[p] = normalise(p, cs.getPropertyValue(p).trim())
  }
  return res
}

async function open(page, url, wait) {
  await page.bringToFront()
  // Desk keeps a realtime socket open, so network-idle never fires there.
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  // Desk animates sidebar colour and width; read after transitions settle.
  await new Promise((r) => setTimeout(r, wait ?? 1500))
}

async function composite(name, a, b) {
  const html = `<canvas id=c></canvas><script>
    async function load(src){const i=new Image();i.src=src;await i.decode();return i}
    window.run=async(a,b)=>{const A=await load(a),B=await load(b);const w=A.width,h=A.height;
      const c=document.getElementById('c');c.width=w*3;c.height=h;const x=c.getContext('2d');
      x.drawImage(A,0,0);x.drawImage(B,w,0);
      const t=document.createElement('canvas');t.width=w;t.height=h;const tx=t.getContext('2d');
      tx.drawImage(A,0,0);const da=tx.getImageData(0,0,w,h);tx.drawImage(B,0,0);const db=tx.getImageData(0,0,w,h);
      const d=x.createImageData(w,h);let n=0;
      for(let i=0;i<da.data.length;i+=4){const diff=Math.abs(da.data[i]-db.data[i])+Math.abs(da.data[i+1]-db.data[i+1])+Math.abs(da.data[i+2]-db.data[i+2]);
        const hit=diff>48;if(hit)n++;d.data[i]=hit?230:da.data[i]*.25+190;d.data[i+1]=hit?40:da.data[i+1]*.25+190;d.data[i+2]=hit?40:da.data[i+2]*.25+190;d.data[i+3]=255}
      x.putImageData(d,w*2,0);return {ratio:n/(w*h),png:c.toDataURL('image/png')}}</script>`
  const p = await browser.newPage()
  await p.setContent(html)
  const res = await p.evaluate((a, b) => window.run(a, b), `data:image/png;base64,${a}`, `data:image/png;base64,${b}`)
  fs.writeFileSync(path.join(out, `${name}-side-by-side.png`), Buffer.from(res.png.split(',')[1], 'base64'))
  await p.close()
  return res.ratio
}

const report = { spec: path.relative(root, specPath), viewport, generatedAt: new Date().toISOString(), pages: [] }
let failures = 0

for (const pg of spec.pages) {
  console.error(`measuring ${pg.name}`)
  // One page at a time, in front: a background tab in headless Chrome may never paint.
  async function capture(page, url, action, side) {
    await open(page, url, pg.wait)
    if (action) {
      await page.evaluate(action).catch(() => {})
      await new Promise((r) => setTimeout(r, 600))
    }
    const values = []
    for (const pair of pg.pairs) values.push(await page.evaluate(measure, pair[side], pair.props || DEFAULT_PROPS))
    return { values, shot: await page.screenshot({ encoding: 'base64' }) }
  }
  const ref = await capture(refPage, spec.reference.base + pg.ref, pg.refAction, 'ref')
  const cand = await capture(candPage, spec.candidate.base + pg.cand, pg.candAction, 'cand')
  const shotA = ref.shot
  const shotB = cand.shot
  const rows = []
  for (const [i, pair] of pg.pairs.entries()) {
    const props = pair.props || DEFAULT_PROPS
    const compared = comparePair({
      ref: ref.values[i],
      cand: cand.values[i],
      props,
      tol: pair.tol ?? 1,
      accept: pair.accept || [],
    })
    if (!compared.ok) failures++
    rows.push({
      name: pair.name,
      ok: compared.ok,
      deltas: compared.deltas,
      accepted: compared.deltas.filter((d) => (pair.accept || []).includes(d.prop)),
      note: pair.note,
    })
  }
  fs.writeFileSync(path.join(out, `${pg.name}-reference.png`), Buffer.from(shotA, 'base64'))
  fs.writeFileSync(path.join(out, `${pg.name}-candidate.png`), Buffer.from(shotB, 'base64'))
  const pixelDiff = await composite(pg.name, shotA, shotB)
  report.pages.push({ name: pg.name, pixelDiffRatio: Math.round(pixelDiff * 1000) / 1000, rows })
  console.log(`\n# ${pg.name}  (pixel diff ${(pixelDiff * 100).toFixed(1)}%, context only)`)
  for (const r of rows) {
    const fmt = (d) => `${d.prop} ${JSON.stringify(d.ref)} -> ${JSON.stringify(d.cand)}`
    const acc = r.accepted.length ? `  [accepted: ${r.accepted.map(fmt).join('; ')}]` : ''
    console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${r.name}${r.ok ? '' : '  ' + r.deltas.filter((d) => !r.accepted.includes(d)).map(fmt).join('; ')}${acc}`)
  }
}

const reportPath = path.join(out, `${path.basename(specPath, '.json')}-report.json`)
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
await browser.close()
console.log(`\n${failures ? failures + ' pair(s) differ' : 'all pairs within tolerance'}. Report: ${path.relative(process.cwd(), reportPath)}`)
process.exit(failures ? 1 : 0)
