# Cohenix patterns

Desk is the authority. ESS and Cargo are supplements. Where they disagree with a verified Desk value, follow Desk, unless the disagreement is the v16.50 dock that this system still targets.

## Cohenix ESS

Path: `frontend/src`. Vue 3.5, Frappe UI 1.0.0, Tailwind 3.4. Shell: `AppLayout.vue` uses `DesktopShell`, `Sidebar`, `DockRail`.

| Pattern | Verdict |
| --- | --- |
| Frappe UI shell, no second header | Matches Mode B |
| Dock 40px / 12px radius / 6px gap (`style.css`, `DockRail.vue`) | Matches the v16.50 target. Conflicts with v16.52's 34px tile. Keep it for ESS |
| Dashboard grid 20 columns, 42px rows, 12px page padding, 8px cell padding | Matches CRM `DashboardGrid.vue`. Standardize |
| Lucide-style duotone module icons | Matches the dock icon rule |
| Org chart, check-in map, PWA banners | Application-specific. Do not copy into other apps |
| `TopProgress` bar | Application-specific loading chrome |

## Cargo Learning admin

Path: `admin/src/shell/shell.css` and `components/layout/SidePanel.vue`.

| Pattern | Verdict |
| --- | --- |
| `--app-header-h: 48px` | Matches the page head |
| Dock comment claims pixel parity with `dock.scss`, and the CSS is 40px tiles | True for v16.50.0. False for the v16.52.0 file. Same decision as ESS |
| Sidebar edge arrow, always visible | Improves the hit target. Acceptable on top of the Desk handle. Do not change the 224px width |
| `SidePanel.vue` at `22rem` (352px) and a 52px header | Conflicts with the 277px form sidebar and the 48px header. New panels use 277px and a 48px header. Leave existing Cargo screens alone unless you are already editing them |
| List/detail layout components | Useful structure. Restyle to the tokens when you touch them |

## Standardize

- Shell widths: dock profile (explicit), sidebar 224px, header 48px
- Dashboard grid from CRM
- Buttons, inputs, and badges from Frappe UI
- Status colors from colors.md

## Leave specific

- ESS org chart, geolocation check-in, salary charts
- Cargo schedule grid, roll-call rows, student wizards
- Cargo's 352px panel, until a screen is rebuilt
