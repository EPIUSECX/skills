import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
for (const script of [
  'scripts/validate-tokens.mjs',
  'scripts/check-design-consistency.mjs',
  'tests/report.test.mjs',
  'tests/credentials.test.mjs',
  'tests/evidence.test.mjs',
]) {
  const result = spawnSync(process.execPath, [path.join(root, script)], { stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status || 1)
}
