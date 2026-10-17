import assert from 'node:assert/strict'
import { resolveCredentials } from '../scripts/credentials.mjs'

assert.equal(resolveCredentials(false), null)
assert.equal(resolveCredentials(undefined), null)

delete process.env.FRAPPE_USER
delete process.env.FRAPPE_PASSWORD
assert.throws(() => resolveCredentials(true), /FRAPPE_USER/)

process.env.APP_USER = 'maya@example.com'
process.env.APP_PASSWORD = 'from-the-environment'
const named = resolveCredentials({ userEnv: 'APP_USER', passwordEnv: 'APP_PASSWORD' })
assert.equal(named.user, 'maya@example.com')
assert.equal(named.password, 'from-the-environment')
delete process.env.APP_USER
delete process.env.APP_PASSWORD

console.log('credentials ok')
