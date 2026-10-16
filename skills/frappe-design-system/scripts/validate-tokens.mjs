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
expect(tokens.extractedFrom.designTarget.version === '16.50.0', 'target version')
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

for (const key of ['--spacing: 0.25rem', '--sidebar-width: 224px', '--dock-tile: 40px', '--form-sidebar-width: 277px']) {
  expect(css.includes(key), `variables.css missing ${key}`)
}
expect(css.includes('--dock-tile: 34px'), 'v16.52 dock override')

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(`tokens ok (${Object.keys(tokens.espresso).length} espresso properties)`)
