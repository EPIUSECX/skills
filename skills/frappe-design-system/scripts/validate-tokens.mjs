import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const tokens = JSON.parse(fs.readFileSync(path.join(root, 'tokens/tokens.json'), 'utf8'))
const css = fs.readFileSync(path.join(root, 'tokens/variables.css'), 'utf8')

const failures = []
function expect(cond, message) {
  if (!cond) failures.push(message)
}

expect(tokens.extractedFrom.runtime.version === '16.52.0', 'runtime version')
expect(tokens.extractedFrom.runtime.commit.startsWith('4515014'), 'runtime commit')
expect(tokens.extractedFrom.designTarget.version === '>=16.50.0', 'supported range')
expect(tokens.extractedFrom.designTarget.latestMeasured === '16.52.0', 'latest measured')
expect(tokens.extractedFrom.designTarget.oldestProfile === '16.50.0', 'oldest profile')
expect(tokens.espresso['--spacing'].value === '0.25rem', '--spacing')
expect(tokens.espresso['--text-base'].value === '14px', '--text-base')
expect(tokens.espresso['--font-weight-regular'].value === '420', 'weight 420')
expect(tokens.espresso['--radius'].value === '8px', 'radius')
expect(tokens.espresso['--gray-900'].value === '#171717', 'gray-900')
expect(tokens.layout.sidebarWidth.value === '224px', 'sidebar')
expect(tokens.layout.formSidebarWidth.value === '277px', 'form sidebar')
expect(tokens.dock['v16.50.0'].tile === '40px', 'target dock tile')
expect(tokens.dock['v16.52.0'].tile === '34px', 'runtime dock tile')
expect(tokens.frappeUi.sidebarDefaultWidth === '15rem', 'frappe-ui sidebar default')
expect(tokens.crm.dashboard.columns === 20 && tokens.crm.dashboard.rowHeight === 42, 'crm grid')

const block = (selector) => css.split(`${selector} {`)[1]?.split('\n}')[0] ?? ''
const light = block(':root')
for (const key of [
  '--spacing: 0.25rem', '--text-base: 14px', '--font-weight-regular: 420', '--radius: 8px', '--radius-lg: 12px',
  '--sidebar-width: 224px', '--form-sidebar-width: 277px', '--input-height: 28px',
  '--ink-gray-9: #0f0f0f', '--ink-gray-6: #525252', '--surface-gray-2: #f3f3f3', '--focus-ring: rgba(124, 124, 124, 0.25)',
  '--icon-xs: 12px', '--icon-sm: 16px', '--icon-md: 20px', '--icon-lg: 24px',
  '--dock-tile: 34px', '--dock-radius: 8px', '--dock-icon: 22px',
  '--dock-logo-height: calc(var(--page-head-height) + 1px)', '--dock-items-pad: 12px', '--dock-items-bleed: 11px',
]) {
  expect(light.includes(key), `:root missing ${key}`)
}
const v1650 = block(':root[data-dock="v16.50"]')
expect(v1650.includes('--dock-tile: 40px') && v1650.includes('--dock-radius: 12px'), 'v16.50 dock profile')
expect(block(':root[data-theme="dark"]').includes('--desk-sidebar-bg: var(--surface-gray-1)'), 'dark sidebar surface')
expect(css.includes(`--gray-900: ${tokens.espresso['--gray-900'].value}`) || light.includes('--ink-gray-8: #171717'), 'gray-900 / ink-gray-8')

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(`tokens ok (${Object.keys(tokens.espresso).length} espresso properties)`)
