# Environment

Measured on this bench on 2026-10-16. Source-defined values come from the files below. Measured values come from Chrome at the viewports in `visual-audit/`.

## Versions

| Piece | Version | Commit | Where |
| --- | --- | --- | --- |
| Frappe (runtime) | 16.52.0 | `4515014c87ece6cb20ee91d2cfb121c5cbd1ff4a` | `/home/ubuntu/frappe-bench/apps/frappe` |
| Frappe (design target) | 16.50.0 | `f20f92d29706510551b4438cc196b0323a7f1a92` | GitHub tag. Not checked out locally. The dock file was fetched and diffed. |
| ERPNext | 16.51.1 | `5af6561f5aa48104559692fb4fd82f2580e8d338` | bench app |
| HRMS | 16.51.0 | `2478afc7a8f4959d500f6d17522853f0d244e38f` | bench app |
| Frappe UI (installed) | 1.0.0 | package in `cohenix_ess/frontend/node_modules/frappe-ui` | Vue app dependency |
| Frappe CRM | develop `47bb9417bd74` | not installed | `frontend/package.json` depends on `frappe-ui@1.0.0-rc.2` |
| Vue (ESS) | ^3.5.13 | `frontend/package.json` | |
| Tailwind (ESS) | ^3.4.17 | `frontend/package.json` | Frappe Desk itself does not use Tailwind. Espresso CSS is plain CSS. |
| Vite (ESS) | ^6.3.5 | | |
| Node used to build the bench | 24.22.0 | `/usr/local/bin/node` | |
| Site | `ess.localhost` | developer mode | web on port 8000, Vite on 8080 |

## What differs between the target and the runtime

`diff -rq` of these files at the two tags found a difference only in `frappe/public/scss/desk/dock.scss`:

- `spacing.css`, `typography.css`, `radius.css`, `button.css`
- `desk/sidebar.scss`, `desk/side_panel.scss`, `desk/css_variables.scss`, `common/css_variables.scss`

So the Espresso scale and the sidebar, page head, and side panel are shared. The dock tile is not. See [navigation.md](navigation.md).

## Desk source map

| Concern | Path under `apps/frappe` |
| --- | --- |
| Espresso tokens | `frappe/public/css/espresso/` |
| Token loading | `frappe/public/scss/espresso/` |
| Dock | `frappe/public/scss/desk/dock.scss` |
| Sidebar | `frappe/public/scss/desk/sidebar.scss` |
| Form sidebar | `frappe/public/scss/desk/form_sidebar.scss` |
| Slide-over | `frappe/public/scss/desk/side_panel.scss` |
| Page head | `frappe/public/scss/desk/page.scss` |
| Icons | `frappe/public/scss/common/icons.scss`, `frappe/public/icons/lucide.svg` |
| Buttons | `frappe/public/css/espresso/components/button.css` |

## Apps inspected

- Cohenix ESS: `/agent/repos/cohenix_ess/frontend`. Vue 3, Frappe UI 1.0.0, route `/ess`.
- Cargo Learning admin: `/agent/repos/cohenix_cargo_learning/admin`. Vue shell in `src/shell/`.
- Frappe CRM: not running. Layout was read from GitHub `develop` at the commit above.

## Tooling

Chrome is `/usr/bin/google-chrome`. Playwright was not installed. The audit script uses `puppeteer-core` against that Chrome. Screenshots are in `assets/screenshots/`. Computed styles are in `references/visual-audit/`.
