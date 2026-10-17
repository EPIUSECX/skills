/**
 * Login for a live Desk. Never embed a password in a script or a spec.
 *
 *   FRAPPE_USER       desk user (required when the spec logs in)
 *   FRAPPE_PASSWORD   that user's password (required when the spec logs in)
 *
 * A spec may name different variables: { "login": { "userEnv": "APP_USER", "passwordEnv": "APP_PASSWORD" } }.
 */
export function resolveCredentials(login) {
  if (!login) return null
  const userEnv = typeof login === 'object' && login.userEnv ? login.userEnv : 'FRAPPE_USER'
  const passwordEnv = typeof login === 'object' && login.passwordEnv ? login.passwordEnv : 'FRAPPE_PASSWORD'
  const user = process.env[userEnv]
  const password = process.env[passwordEnv]
  if (!user || !password) {
    throw new Error(
      `Live Desk login needs $${userEnv} and $${passwordEnv}. Do not put a password in the spec or the script.`,
    )
  }
  return { user, password }
}
