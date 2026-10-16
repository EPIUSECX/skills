# Architecture

Frappe draws three different UIs. Match the one you are extending.

## Desk (Mode A)

The page is server-rendered HTML plus Desk bundles. The shell is:

```
pinned dock (57px, only inside an app) | sidebar (224px) | .page-head (48px) + .page-container
```

On `/desk` (the Apps screen) the dock and sidebar are not in the layout. Measured at 1440×900: `.body-sidebar` and `.dock` had a 0×0 box, and `.page-container` was 1430×559. See `assets/screenshots/desktop-1440x900.png`.

Inside an app (User list, 1440×900):

| Element | x | width | height | Source of the number |
| --- | --- | --- | --- | --- |
| `.dock` | 0 | 57 | 900 | measured. CSS is `calc(56px + 1px)` |
| `.body-sidebar` | 57 | 224 | 900 | measured. Token `--sidebar-width: 224px` |
| `.page-head` | 281 | 1149 | 49 | measured. Token is 48px; the extra pixel is the bottom border |
| `.page-container` | 281 | 1149 | 900 | measured |

281 = 57 + 224. Do not add another offset.

A Desk Page script must fill the page body only. `examples/desk-page/page.js` shows the shape. Routing stays on `frappe.set_route` / `frappe.router`.

## Standalone Vue (Mode B)

Cohenix ESS composes Frappe UI `DesktopShell`, `Sidebar`, and a local `DockRail`. Cargo Learning does the same in `admin/src/shell/`. Both apps set their own dock geometry in CSS. That geometry is the v16.50 profile. The default profile in this skill is v16.52, the latest measured release. Leave ESS and Cargo on `data-dock="v16.50"` until those products move.

Frappe UI 1.0.0 `Sidebar` defaults:

- `width: '15rem'` (240px at a 16px root)
- `collapsedWidth: '3rem'` (48px)
- transition `duration-300 ease-in-out`

Desk's panel is 224px, which the sidebar SCSS comment calls 14rem. Pass `width="224px"` and `collapsedWidth="48px"`.

`PageHeader` in these apps is 48px (`min-h-12`). Cargo sets `--app-header-h: 48px` for that reason.

## CRM

CRM's `DesktopLayout.vue` is a horizontal shell: `AppSidebar`, then a column of `AppHeader` plus the page. It does not draw the Desk dock. The record side panel is `SidePanelLayout.vue`, a stack of sections, not a fixed pixel column. The dashboard is `grid-layout-plus` at 20 columns and 42px rows.

## What not to duplicate

| You are in | Do not add |
| --- | --- |
| Desk Page or Form | dock, sidebar, navbar, page head |
| Frappe UI app that already has `DesktopShell` | a second sidebar |
| CRM-style record | a 380px slide-over when the 277px form sidebar is the pattern you were asked for |

The 380px figure is the Desk `.side-panel` minimum, used when a form opens a drawer. It is a different component from the form sidebar.
