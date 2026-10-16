---
name: frappe-design-system
description: >-
  Build or review Frappe frontends so they look and behave like Frappe Desk.
  Use when creating a Frappe frontend, a Vue or Frappe UI page, a custom Desk
  page, a dashboard, a CRM-style record with a right-hand panel, a Cohenix
  interface, or when auditing visual consistency. Covers native Desk (Mode A)
  and a standalone Vue shell (Mode B), Espresso tokens, and the v16.50 dock
  versus the v16.52 dock.
---

# Frappe design system

Match Frappe Desk. Do not invent a second visual language.

Read the token file before writing CSS. If a pattern is missing, inspect the closest native Desk file and record the value. Do not guess a spacing step, type size, radius, or icon set.

Two versions matter:

| Role | Version | Commit | What differs |
| --- | --- | --- | --- |
| Design target | v16.50.0 | `f20f92d29706510551b4438cc196b0323a7f1a92` | Dock tile 40px, gap 6px, tile radius 12px |
| Runtime that was measured | v16.52.0 | `4515014c87ece6cb20ee91d2cfb121c5cbd1ff4a` | Dock tile 34px, gap 4px, tile radius 8px |

Sidebar 224px, collapsed sidebar 48px, pinned dock outer width 57px, page head 48px, and the Espresso color, type, radius, and spacing scales are the same in both tags. Details: [references/environment.md](references/environment.md) and [references/navigation.md](references/navigation.md).

Navigation records (Dock, Sidebar, Apps tile) belong to the `frappe-desk-navigation` skill. This skill owns how those surfaces are drawn.

## Pick a mode

**Mode A — inside Desk.** Keep the Desk shell. Do not draw a second dock, sidebar, or page header. Use a Desk Page, a Workspace, or a Form. Reuse `.page-head`, list view, and form layout.

**Mode B — standalone Vue.** Recreate the shell with Frappe UI: `DesktopShell` or `Sidebar` at `width="224px"` and `collapsedWidth="48px"`, plus a dock only when the product is a separate app. Frappe UI's Sidebar default is `15rem` (240px). That is wider than Desk. Set the width.

Pick the dock profile for the Desk version you are matching:

- New Cohenix apps that follow the v16.50 target, including current Cohenix ESS and Cargo Learning: 40px tiles. Set no `data-dock`, or `data-dock="v16.50"`.
- A page that must match a v16.52 bench: `data-dock="v16.52"` (34px tiles). Do not copy the ESS dock CSS onto that bench.

## Before you write UI

1. Open [tokens/tokens.json](tokens/tokens.json) and [tokens/variables.css](tokens/variables.css).
2. Open the component row in [references/components.md](references/components.md). Prefer a native Desk control or a Frappe UI component over a new one.
3. Open the page recipe in [references/layouts.md](references/layouts.md) or [references/dashboards.md](references/dashboards.md).
4. Run `node scripts/check-design-consistency.mjs` on the files you add.

## Workflows

### Create

1. Choose Mode A or Mode B.
2. Choose the dock profile if you draw a dock.
3. Build from [assets/templates/shell.css](assets/templates/shell.css) and the example closest to the page.
4. Use only the spacing steps in [references/spacing.md](references/spacing.md).
5. Screenshot at 1440×900 and compare geometry with `node scripts/compare-screenshots.mjs`.

### Modify

1. Read the existing shell first. ESS and Cargo already implement the v16.50 dock. Do not "correct" them to 34px unless the product is moving to v16.52.
2. Change tokens, not one-off pixel values.
3. Re-run the consistency script on the touched files.

### Audit

1. Measure the running Desk with `node scripts/audit-ui.mjs` when a bench is up.
2. Compare computed custom properties to `tokens.json`.
3. List mismatches as target (v16.50), runtime (v16.52), or drift. Drift is a value that matches neither.

### Reproduce

1. Find the Desk source file named in the reference.
2. Copy the geometry. Do not trace a screenshot into new numbers.
3. Mark anything you could not measure as unverified.

## Hard rules

- Spacing comes from `--spacing` (4px) or the legacy scale in [references/spacing.md](references/spacing.md). Do not add a new step.
- Type uses the Espresso sizes. Body text is 14px, weight 420. Do not use 15px or weight 400 for UI text.
- Icons: Lucide for sidebar rows, an app `*-duotone` sprite for the dock. Stroke 1.5. Sizes 12, 16, 20, or 22 only. See [references/icons.md](references/icons.md).
- Cards use radius 8px and a 1px `--outline-gray-1` border. Do not add a drop shadow to a resting card. `--shadow-sm` is for raised controls (active dock tile, menus).
- Dashboard cards stay compact. A metric uses the number-card padding `8px 8px 8px 12px`. A CRM-style board is 20 columns and 42px rows. See [references/dashboards.md](references/dashboards.md).
- The right-hand record panel is 277px when it is the form sidebar. The Desk slide-over is `clamp(380px, 46vw, 780px)`. CRM fields are 35% / 65%. See [references/right-panels.md](references/right-panels.md).
- Do not rebuild Button, Input, Select, Dialog, or Sidebar when Frappe UI already provides them.

## Examples

| Example | What it proves |
| --- | --- |
| [examples/dashboard](examples/dashboard/index.html) | Compact metric row and a 20×42 dashboard grid |
| [examples/detail-view](examples/detail-view/index.html) | List, filters, and a 277px detail panel. Data rows are 41px |
| [examples/record-form](examples/record-form/index.html) | Item form chrome: tabs, two columns, 80px mark, 277px panel |
| [examples/modal](examples/modal/index.html) | 575px dialog |
| [examples/standalone-frontend](examples/standalone-frontend/index.html) | Dock, 224px sidebar, 48px header |
| [examples/desk-page](examples/desk-page/page.js) | Mode A page that does not draw a shell |
| [examples/right-panel](examples/right-panel/index.html) | CRM field rows inside the 277px panel |

## Checks

```bash
node scripts/validate-tokens.mjs
node scripts/check-design-consistency.mjs
node tests/components/tokens.test.mjs
# Needs puppeteer-core and Chrome. Optional, when a bench is running:
node scripts/audit-ui.mjs --out references/visual-audit
node tests/visual/geometry.test.mjs
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
