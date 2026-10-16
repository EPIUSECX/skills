# Responsive

## Desk breakpoints

Source: `desk/css_variables.scss`.

| Token | px |
| --- | --- |
| `--xxl-width` | 1440 |
| `--xl-width` | 1200 |
| `--lg-width` | 992 |
| `--md-width` | 768 |
| `--sm-width` | 567 |
| `--xs-width` | 0 |

The sidebar becomes a drawer below `md` (768). The side panel becomes `100vw` below `md`. `.page-title .sidebar-toggle-btn` is hidden from 992px up (`page.scss`).

## Frappe UI breakpoints

`Sidebar.vue` uses VueUse `breakpointsTailwind` and collapses below Tailwind `sm` (640px) when `collapsed` is unset. That is not the Desk 768px drawer. If you need Desk behavior, pass `collapsed` yourself from a 768px media query.

## Viewports that were captured

| Viewport | Page | Result |
| --- | --- | --- |
| 1440×900 | `/desk` | Apps tiles, no rail. `desktop-1440x900.png` |
| 1280×800 | `/desk` | Same shell, narrower. `desktop-1280x800.png` |
| 1920×1080 | `/desk` | Same shell, wider. `desktop-1920x1080.png` |
| 390×844 | `/desk` | One column of tiles. `desktop-390x844.png` |
| 1440×900 | User list | Dock 57, sidebar 224, head 49. `list-user-1440x900.png` |
| 1440×900 | User form | Form sidebar 277. `form-user-1440x900.png` |

List and form were measured at the other widths. Shell tokens do not change. Content width does.

| Viewport | Dock | Sidebar | Page head | Notes |
| --- | --- | --- | --- | --- |
| 1280×800 list | 57 at x=0 | 224 at x=57 | 49, width 989 | data row 41px, x=303 |
| 1920×1080 list | 57 | 224 at x=57 | 49, width 1629 | data row 41px, width 1585 |
| 390×844 list | 0 (not in layout) | 224 at x=0, the drawer | 49, width 390 | data row 67px and wider than the viewport |
| 390×844 form | 0 | 224 drawer | 49, width 390 | form sidebar still 277px, parked at x=−305 |

Files: `references/visual-audit/list-1280x800.json`, `list-1920x1080.json`, `list-390x844.json`, `form-1280x800.json`, `form-1920x1080.json`, `form-390x844.json`.

## Rules

- At 1440, do not cap a dashboard at 900px.
- At 390, one column, full-width panel, no dock.
- Touch targets on phone can grow. Desktop rows stay at the token height.
