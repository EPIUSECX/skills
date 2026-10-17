---
name: frappe-design-system
description: >-
  Mandatory for any Frappe interface: new or existing Desk Pages, Workspaces,
  Form and List views, Vue or Frappe UI screens, CSS or SCSS, typography,
  padding, spacing, colours, icons, navigation, sidebars, docks, responsive
  layout, and visual review. Use it when creating, modifying, or auditing a
  Frappe frontend, including a change that only restyles a page that already
  exists. Covers native Desk (Mode A) and a standalone Vue shell (Mode B),
  Espresso tokens, and the dock profiles for Frappe Desk 16.50 and later,
  including v16.52. A static CSS check is not verification. Render the page
  and compare it.
---

# Frappe design system

Match Frappe Desk. Do not invent a second visual language.

Read the token file before writing CSS. If a pattern is missing, inspect the closest native Desk file and record the value. Do not guess a spacing step, type size, radius, or icon set.

The supported range is Frappe Desk 16.50 and later. It is not locked to 16.50. v16.52 is a supported release.

| Release | Commit | Dock |
| --- | --- | --- |
| v16.50.0, oldest profile | `f20f92d29706510551b4438cc196b0323a7f1a92` | Tile 40px, gap 6px, radius 12px. Set `data-dock="v16.50"` |
| v16.52.0, latest measured, the default | `4515014c87ece6cb20ee91d2cfb121c5cbd1ff4a` | Tile 34px, gap 4px, radius 8px. Logo band 49px, first tile at y=61 |

Sidebar 224px, collapsed sidebar 48px, pinned dock outer width 57px, page head border box 49px, and the Espresso color and spacing scales are the same across this range. The dock is the piece that moves. When a later 16.x release changes it, add a profile. Do not invent a third tile size. Copy numbers from [references/measured-desk.md](references/measured-desk.md).

Navigation records (Dock, Sidebar, Apps tile) belong to the `frappe-desk-navigation` skill. This skill owns how those surfaces are drawn.

## Pick a mode

**Mode A — inside Desk.** Keep the Desk shell. Do not draw a second dock, sidebar, or page header. Use a Desk Page, a Workspace, or a Form. Reuse `.page-head`, list view, and form layout.

**Mode B — standalone Vue.** Use Frappe UI for the shell and the controls: `DesktopShell`, `Sidebar` at `width="224px"` and `collapsed-width="48px"`, `SidebarHeader`, `SidebarItem`, `Button`, `TextInput`, `Checkbox`, `Badge`, `Breadcrumbs`, `Avatar`. Frappe UI's Sidebar default is `15rem` (240px). Set the width. Do not use `SidebarRail` for the Desk dock: it is 50px with 28px items. Draw the dock from `assets/templates/shell.css` (`.dock`, or the `.desk-dock*` block in `examples/standalone-vue`).

Frappe UI does not match Desk until you override these. `examples/standalone-vue/src/style.css` is the working set:

- Load InterVariable and set the body to 14px / 420 / `--ink-gray-6`. Frappe UI's base is 16px / 400.
- `SidebarHeader` inner padding is `px-1.5`. Desk is `12px 15px`.
- `PageHeader` padding is `px-5` (20px). Desk is 15px.
- Put 18px between the utility sidebar group and the module group.
- In dark mode `--surface-sidebar` is transparent. Paint the sidebar and the dock with `--surface-gray-1`.
- The scrolling page uses `scrollbar-gutter: stable`.
- Number-card groups are 15px apart. The next widget group is 40px below.

Pick the dock profile for the Desk version you are matching:

- No attribute: the latest measured release. Today that is v16.52 (34px tiles). Use this for a new app on Frappe 16.52 or later.
- `data-dock="v16.50"`: 40px tiles. Current Cohenix ESS and Cargo Learning ship this profile. Leave them on it until that product moves.

## Before you write UI

1. Record the Frappe version on the bench (`bench version` or the site's `tabInstalled Application`). Pick the dock profile for that version. Do not assume 16.50.
2. Load this skill and, when the change touches the Apps tile, Dock, or Sidebar records, the `frappe-desk-navigation` skill. Navigation records belong to that skill. This skill owns how those surfaces are drawn.
3. Open [tokens/tokens.json](tokens/tokens.json) and [tokens/variables.css](tokens/variables.css).
4. Open the component row in [references/components.md](references/components.md). Prefer a native Desk control or a Frappe UI component over a new one.
5. Open the page recipe in [references/layouts.md](references/layouts.md) or [references/dashboards.md](references/dashboards.md). Inspect the existing page and the closest native Desk screen before editing.
6. Run `node scripts/check-design-consistency.mjs` on the files you add. That script is a hint. It is not visual verification.

## Visual verification

Create, Modify, and Audit all follow the same loop. Do not stop after a static CSS check. Do not claim a browser pass you did not run.

**Inspect → Implement → Render → Compare → Correct → Verify**

1. Identify the Frappe version and whether the screen is Mode A or Mode B.
2. Load this skill and the navigation skill when the chrome is in scope.
3. Inspect the current implementation and the native reference named in the recipe. Compare like with like: a list with a list, a number card with a number card. Do not require an unrelated page to be pixel-identical.
4. Implement the change with the measured tokens.
5. Launch the application (the bench site, or the example server).
6. Open every affected route in a browser.
7. Capture screenshots at 1440×900, 1280×800, and 390×844.
8. Compare padding, spacing, type, weight, colour, icons, navigation, dimensions, alignment, and the three widths. `node scripts/verify-ui.mjs <spec.json>` writes `verify-report.json`. A missing selector fails the run.
9. Use the controls a person would use: buttons, navigation, forms, dialogs, and the states the change touches (hover, focus, empty, error).
10. Correct the defects.
11. Repeat from Render until the report status is `pass` and `node scripts/check-evidence.mjs` says the screenshots are newer than the UI sources.

Login comes from `FRAPPE_USER` and `FRAPPE_PASSWORD`. Do not write a password into a spec, a script, or a commit. If the app cannot be launched, say that visual verification did not run. A consistency script exiting 0 is not a substitute.

The procedure is written out in [references/visual-verification.md](references/visual-verification.md). An app repo installs the enforcement files from [cursor/](cursor/).

## Workflows

### Create

1. Choose Mode A or Mode B.
2. Choose the dock profile if you draw a dock. Leave an app that already ships `data-dock="v16.50"` on that profile until the product moves.
3. Build from [assets/templates/shell.css](assets/templates/shell.css) and the example closest to the page.
4. Use only the spacing steps in [references/spacing.md](references/spacing.md).
5. Run the visual verification loop. With a bench up, `node scripts/compare-pages.mjs tests/visual/parity-static.json` checks the skill examples. For an application route, write a spec and run `node scripts/verify-ui.mjs`. Without a bench, run `node tests/visual/geometry.test.mjs` and say the live pages were not opened.

### Modify

1. Read the existing shell first. ESS and Cargo ship the v16.50 dock. Leave that profile in place until the product moves to a later Desk. New pages use the default profile.
2. Change tokens, not one-off pixel values.
3. Re-run the consistency script on the touched files, then the visual verification loop on the routes those files render. A one-line CSS edit still needs a render.

### Audit

1. Measure the running Desk with `node scripts/audit-ui.mjs` when a bench is up. It needs `FRAPPE_USER` and `FRAPPE_PASSWORD`.
2. Compare computed custom properties to `tokens.json`.
3. List mismatches as the v16.50 profile, the current profile (v16.52), or drift. Drift is a value that matches neither.
4. Open the affected routes at 1440×900, 1280×800, and 390×844. Record what was not opened.

### Reproduce

1. Find the Desk source file named in the reference.
2. Copy the geometry. Do not trace a screenshot into new numbers.
3. Mark anything you could not measure as unverified.

## Hard rules

- Spacing comes from `--spacing` (4px) or the legacy scale in [references/spacing.md](references/spacing.md). Do not add a new step.
- Type uses the Espresso sizes. Body text is 14px, weight 420, `--ink-gray-6`. The page title (the breadcrumb) is 16px / 500. Field labels are 14px / 420 / `--ink-gray-6`. Desk itself uses weight 400 on list-header labels and form tabs. Do not use 400 for buttons, sidebar labels, or field values, and do not use 15px.
- Icons: Lucide for sidebar rows, an app `*-duotone` sprite for the dock. Stroke 1.5. Sizes 12, 16, 20, 24. 22px is only `.icon-rail` on the v16.52 dock. See [references/icons.md](references/icons.md).
- Number cards and chart cards use radius 12px and a 1px `--outline-gray-1` border. Controls use radius 8px. Do not add a drop shadow to a resting card. `--shadow-sm` is for raised controls (the v16.52 active dock tile, the active sidebar row).
- A number card is padding `12px 16px`, title 13px `--ink-gray-5`, value 17px / 600. A CRM-style board is 20 columns and 42px rows. See [references/dashboards.md](references/dashboards.md).
- The right-hand record panel is 277px when it is the form sidebar. The Desk slide-over is `clamp(380px, 46vw, 780px)`. CRM fields are 35% / 65%. See [references/right-panels.md](references/right-panels.md).
- Do not rebuild Button, Input, Select, Dialog, or Sidebar when Frappe UI already provides them.

## Examples

| Example | What it proves |
| --- | --- |
| [examples/dashboard](examples/dashboard/index.html) | Number cards (`12px 16px`, value 17px) and chart cards, 15px and 40px gaps |
| [examples/detail-view](examples/detail-view/index.html) | List, filters, and a 277px detail panel. Data rows are 41px, 67px below 576px |
| [examples/record-form](examples/record-form/index.html) | Item form chrome: 42px tabs, two columns, 80px mark, 277px panel |
| [examples/modal](examples/modal/index.html) | 575px dialog, radius 12px |
| [examples/standalone-vue](examples/standalone-vue/) | Mode B. Frappe UI shell plus the overrides above. Needs the ESS `node_modules` (see its README) |
| [examples/desk-page](examples/desk-page/page.js) | Mode A. `frappe.widget.WidgetGroup` only. Draws no shell |
| [examples/right-panel](examples/right-panel/index.html) | CRM field rows inside the 277px panel |

## Checks

```bash
node scripts/validate-tokens.mjs
node scripts/check-design-consistency.mjs
node tests/components/tokens.test.mjs
node tests/report.test.mjs
node tests/credentials.test.mjs
node tests/evidence.test.mjs
# Needs puppeteer-core and Chrome. Optional, when a bench is running:
node scripts/audit-ui.mjs --out references/visual-audit
node tests/visual/geometry.test.mjs
node scripts/compare-pages.mjs tests/visual/parity-static.json
node scripts/compare-pages.mjs tests/visual/parity-users.json
node scripts/compare-pages.mjs tests/visual/parity-mobile.json
```

## References

| File | Use it for |
| --- | --- |
| [references/environment.md](references/environment.md) | Versions, commits, what was not installed |
| [references/architecture.md](references/architecture.md) | Where Desk, Frappe UI, and the apps draw UI |
| [references/design-tokens.md](references/design-tokens.md) | How to read the token files |
| [references/typography.md](references/typography.md) | Sizes, weights, line height |
| [references/spacing.md](references/spacing.md) | The 4px step and legacy paddings |
| [references/colors.md](references/colors.md) | Surfaces, ink, outlines |
| [references/layouts.md](references/layouts.md) | Page recipes |
| [references/measured-desk.md](references/measured-desk.md) | The numbers to copy |
| [references/navigation.md](references/navigation.md) | Dock and sidebar geometry |
| [references/components.md](references/components.md) | Component catalogue |
| [references/forms.md](references/forms.md) | Form controls |
| [references/tables.md](references/tables.md) | Lists and density |
| [references/dashboards.md](references/dashboards.md) | Boards and metric cards |
| [references/right-panels.md](references/right-panels.md) | Form sidebar, slide-over, CRM panel |
| [references/icons.md](references/icons.md) | Lucide and duotone |
| [references/interactions.md](references/interactions.md) | Motion and states |
| [references/responsive.md](references/responsive.md) | Breakpoints |
| [references/accessibility.md](references/accessibility.md) | Focus, names, contrast |
| [references/cohenix-patterns.md](references/cohenix-patterns.md) | ESS and Cargo versus Desk |
| [references/anti-patterns.md](references/anti-patterns.md) | What to reject |
| [references/gap-report.md](references/gap-report.md) | What was verified and what was not |
| [references/visual-verification.md](references/visual-verification.md) | The render loop, specs, and evidence |
