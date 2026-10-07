# Frontend & UI

Frappe apps can have three types of frontends. Detect which one applies by looking at the app structure, then load ONLY the relevant file:

| Type | How to detect | File |
|------|--------------|------|
| **Desk** (admin UI) | All apps have this by default | [frontend-desk.md](./frontend-desk.md) |
| **Vue 3 + frappe-ui + Vite** | `frontend/package.json` that depends on `frappe-ui` (the Vite config can be `.js`, `.mjs` or `.ts`) | [frontend-vue.md](./frontend-vue.md) |
| **Portal pages** | `www/` with `.html` templates that extend `templates/web.html` | [frontend-portal.md](./frontend-portal.md) |

Every new app gets an empty `www/`, and a Vue SPA also ships `www/<route>.html`, so the presence of `www/` alone proves nothing.

An app can use multiple types simultaneously (e.g. Desk for admin + Vue SPA for users).

For the app's tile on the Apps screen, its rail (Dock) and its module Sidebars on v16.50, use the `frappe-desk-navigation` skill.
