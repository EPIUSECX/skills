import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const roots = ['examples', 'assets/templates', 'tokens/variables.css']
const banned = [
  [/padding:\s*24px/, '24px padding is not a Desk step'],
  [/font-weight:\s*400\b/, 'UI text uses weight 420'],
  [/font-size:\s*15px/, '15px is not an Espresso size'],
  [/border-radius:\s*16px/, 'cards use 8px'],
  [/width:\s*15rem/, 'Frappe UI sidebar default is 240px. Desk is 224px'],
  [/width:\s*22rem/, 'a new detail panel is 277px, not 22rem'],
]

function files(entry, out = []) {
  const full = path.join(root, entry)
  if (!fs.existsSync(full)) return out
  const stat = fs.statSync(full)
  if (stat.isFile()) return [full]
  for (const name of fs.readdirSync(full)) {
    const next = path.join(full, name)
    if (fs.statSync(next).isDirectory()) files(path.relative(root, next), out)
    else if (/\.(css|html|vue|js)$/.test(name)) out.push(next)
  }
  return out
}

const hits = []
for (const entry of roots) {
  for (const file of files(entry)) {
    const text = fs.readFileSync(file, 'utf8')
    for (const [pattern, message] of banned) {
      if (pattern.test(text)) hits.push(`${path.relative(root, file)}: ${message}`)
    }
  }
}

if (hits.length) {
  console.error(hits.join('\n'))
  process.exit(1)
}
console.log('consistency ok')
