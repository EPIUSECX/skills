import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export async function loadPuppeteer() {
  const here = path.dirname(new URL(import.meta.url).pathname)
  const candidates = [
    process.env.PUPPETEER_CORE,
    path.join(here, '../node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js'),
  ].filter(Boolean)
  for (const file of candidates) {
    if (fs.existsSync(file)) return import(pathToFileURL(file).href)
  }
  return import('puppeteer-core')
}

export async function launch() {
  const { default: puppeteer } = await loadPuppeteer()
  return puppeteer.launch({
    executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })
}
