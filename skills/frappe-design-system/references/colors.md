# Colors

Source: `frappe/public/css/espresso/colors.css` light block. First-stop semantic tokens. The full palette is in `tokens/tokens.json`.

Desk primary is gray-900 (`#171717`), not blue. `$primary: $gray-900` in `espresso/_colors.scss`. Blue is for links and charts.

## Surfaces

| Token | Resolves to | Hex |
| --- | --- | --- |
| `--surface-base` | `--white` | `#ffffff` |
| `--surface-gray-1` / `--surface-sidebar` | `--gray-50` | `#f8f8f8` |
| `--surface-gray-2` | `--gray-100` | `#f3f3f3` |
| `--surface-gray-3` | `--gray-200` | `#ededed` |
| `--surface-gray-10` | `--gray-900` | `#171717` |

Measured sidebar background: `rgb(248, 248, 248)`. Measured page background: `rgb(255, 255, 255)`.

## Ink

| Token | Hex | Use |
| --- | --- | --- |
| `--ink-gray-8` | `#171717` | Primary text |
| `--ink-gray-7` | `#383838` | Sidebar icons, secondary |
| `--ink-gray-6` | `#525252` | Badge text, and the computed color on `.body-sidebar` |
| `--ink-gray-5` | `#7c7c7c` | Labels, placeholders, breadcrumbs |
| `--ink-base` | `#ffffff` | Text on a solid gray-900 button |
| `--ink-blue-link` | `#0d8ef8` | Links (`--blue-500`) |

## Lines

| Token | Hex |
| --- | --- |
| `--outline-gray-1` | `#ededed` |
| `--outline-gray-2` | `#e2e2e2` |
| `--outline-gray-3` | `#c7c7c7` |

Borders are 1px. Resting cards and the sidebar use `--outline-gray-1`. Outline buttons use `--outline-gray-2`.

## Status

Use the pale surface plus a darker ink. Do not invent a green.

| State | Surface | Ink |
| --- | --- | --- |
| Success | `--green-50` `#f0faf3` | `--green-600` `#268c5c` |
| Warning | `--amber-50` `#fdf8ed` | `--amber-500` `#df9311` |
| Danger | `--red-50` `#fff5f5` | `--red-500` `#e03434` |

`$danger` in the SCSS bridge is `#e03636`. The Espresso `--red-500` is `#e03434`. New UI uses `--red-500`.

## Dark, measured

Set `data-theme="dark"` on the document element of the User form. Computed custom properties (`references/visual-audit/dark.json`):

| Token | Computed |
| --- | --- |
| `--surface-base` | `#171717` |
| `--ink-gray-8` | `#d9d9d9` |
| `--ink-gray-5` | `#7a7a7a` |
| `--outline-gray-1` | `#242424` |
| `--gray-900` | `#1f1f1f` |
| `--desk-sidebar-bg` | `#1f1f1f` |
| `--surface-sidebar` | transparent (`#ffffff00`) |
| `--focus-outline-default` | `3px solid #464646cc` |

`.page-container` painted `rgb(23, 23, 23)`. A pixel sample of `assets/screenshots/form-dark-1440x900.png` at (600, 200) is the same `#171717`. In that same call, `.body-sidebar`'s used background was still `rgb(248, 248, 248)`. The variable had changed. The sidebar element's used value had not. Do not describe the sidebar as repainted from this capture.

`tokens/variables.css` repeats these computed dark values under `:root[data-theme="dark"]`.

## Focus

Light: `--focus-outline-default: 2px solid #c9c9c9e5`. Also red, green, amber, blue, and violet rings in `effects.css`. Dark rings are 3px and live under `[data-theme="dark"]`.

## Shadows

Resting surfaces have no shadow. Elevations in `effects.css` are for floating layers:

- `--shadow-sm` — v16.52 active dock tile, active sidebar row
- Dialog — `0 5px 10px rgba(0,0,0,0.1)` (`$modal-content-box-shadow-sm-up`). Not `--shadow-md`
- `--shadow-lg` — `.side-panel`
- `--shadow-2xl` — floating dock and `.dropdown-menu`

A dashboard card does not get `--shadow-md`.
