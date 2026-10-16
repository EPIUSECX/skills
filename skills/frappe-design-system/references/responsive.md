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

The list and the form were not re-captured at 1280, 1920, or 390. Do not invent those measurements. The shell tokens do not change with the viewport. The content width does.

## Rules

- At 1440, do not cap a dashboard at 900px.
- At 390, one column, full-width panel, no dock.
- Touch targets on phone can grow. Desktop rows stay at the token height.
