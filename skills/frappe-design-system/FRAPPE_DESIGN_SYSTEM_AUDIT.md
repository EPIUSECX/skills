# Frappe design system audit

Independent audit of `skills/frappe-design-system` against Frappe Desk. The skill was already on this branch. This pass re-measured it, corrected the values that did not match Desk, and re-ran the comparisons.

## Executive summary

The skill's procedure was ahead of its measurements. `SKILL.md` and several references told an agent to draw a 14px page title, 8px cards with padding `8px 8px 8px 12px`, and a 22px dock glyph on both versions. None of those match the Desk that is running here, or v16.50 source.

After this pass the static examples, the Vue example, and a Mode A Desk page were built and compared to a live bench. The geometry pairs in the three parity specs pass. Two limits stay: Frappe CRM is not installed, and v16.50 was read from source rather than booted.

**Verdict: APPROVED WITH LIMITATIONS.**

## Versions

| Role | Version | Commit | How it was used |
| --- | --- | --- | --- |
| Design target | v16.50.0 | `f20f92d29706510551b4438cc196b0323a7f1a92` | `git show audit-v16.50.0` on `dock.scss`, `checkbox.scss`, `list.scss`, `modal.scss` |
| Bench | v16.52.0 | `4515014c87ece6cb20ee91d2cfb121c5cbd1ff4a` | `http://127.0.0.1:8000`, Administrator. Every live number below comes from this site |
| Frappe UI | 1.0.0 | Cohenix ESS `frontend/node_modules` | Mode B example. Not upgraded |

The complete SCSS delta that matters for this skill, v16.50 to v16.52, is the dock (tile 40→34, radius 12→8, hover becomes a fill, `.icon-rail` 22px) plus small card, icon, and onboarding changes. Sidebar width, page head, and Espresso type do not move.

## Source verification

Checked in the v16.50 tree, not from the skill's old notes:

- Pinned dock padding is `8px` with `padding-top: 4px`, so the used value is `4px 8px 8px`. Tile hover sets ink only. The comment in `dock.scss` is "a step in ink and no fill". `--dock-tile-hover: rgba(0,0,0,0.07)` paints the user-menu button.
- `--checkbox-size` is 14px, 18px below 768px. `list.scss` forces list checkboxes to 15px below `$grid-breakpoints.sm` (576px).
- Dialog backdrop is `$modal-backdrop-bg: var(--gray-800)` at opacity 0.8. The dialog shadow is `0 5px 10px rgba(0,0,0,0.1)`, width `$modal-md: 575px`.
- Number-card padding on the running Selling dashboard is `12px 16px`, radius 12px, value 17px / 600. The Espresso token `--number-card-padding: 8px 8px 8px 12px` is not what the widget paints.

## Design fidelity

Compared at 1440×900 with `scripts/compare-pages.mjs`. Colour is normalised to sRGB because Frappe UI emits `oklch()` and `color(srgb)`. A delta within 1px passes. Properties in a pair's `accept` list are recorded and do not fail the run.

| Spec | Pages | Result |
| --- | --- | --- |
| `tests/visual/parity-static.json` | detail list, dashboard, record form, modal, dark list, dock switched to v16.52 | all pairs within tolerance |
| `tests/visual/parity-users.json` | Vue users list, Vue dashboard, Vue list in dark | all pairs within tolerance |
| `tests/visual/parity-mobile.json` | list at 390, open drawer, form at 390 | all pairs within tolerance |

Accepted on purpose, each with a note in the spec:

- v16.50 example dock versus the v16.52 bench dock (40/12/ink-gray-7 versus 34/8/ink-gray-5). The same example with `data-dock="v16.52"` matches the bench with nothing accepted.
- Idle sidebar row radius (transparent, so 0 versus 8 is not visible).
- Frappe UI breadcrumb line-height.
- A lone filter input keeps four radii; Desk joins it to a group.
- Checked checkbox border. Desk sets `border: none`, so the computed border reads black. The example border equals the `#171717` fill.

Pixel-diff ratios are context. They move when the demo data differs. The modal ratio fell from 90.9% to 3.3% once the backdrop used `#383838` at 0.8. The mobile drawer stays near 45% because the example's link list is shorter than Desk's and Desk shows a search field and the user card. The drawer box itself matches (224px, x=0, sidebar surface).

## Component architecture

**Mode A.** A Desk Page does not draw a dock, sidebar, or page head. `examples/desk-page/page.js` calls `frappe.ui.make_app_page` and `frappe.widget.WidgetGroup`. Loaded in the running Desk, it rendered "New Employee", three number cards at `12px 16px` (Active Customers, Annual Sales, Active Suppliers), and the Sales Order Trends chart.

**Mode B.** Frappe UI owns Sidebar, buttons, inputs, checkbox, badge, breadcrumbs, and avatar. The skill owns the overrides those components need, listed in `SKILL.md` and implemented in `examples/standalone-vue/src/style.css`. `SidebarRail` is not the Desk dock.

**Shared library versus Desk.** Anything Desk already paints (list view, form, dialog, number card, chart) stays in Desk for Mode A. A standalone app reuses Frappe UI and adds only the shell rules in `shell.css`: dock profiles, the 18px sidebar group gap, the 67px mobile row, and the dialog backdrop. Do not copy ESS dock CSS onto a v16.52 bench, and do not retile ESS to 34px while its target is v16.50.

## Visual regression

`tests/visual/geometry.test.mjs` serves the five static examples over HTTP (Chrome will not resolve an external `<use>` on `file://`) and checks dock 57, tile 40, sidebar 224, nav row 28, header 49, panel 277, list head 30, list row 41, tabs 42, modal 575, button 28, input 28, card padding `12px 16px`, card radius 12px, and InterVariable. It also fails if a sprite symbol is missing or still wraps a nested `<svg>`. A deliberately broken sprite failed the test; restoring it passed.

## Skill quality

`SKILL.md` now points at `references/measured-desk.md` and at `compare-pages.mjs`. The old `compare-screenshots.mjs` script and the `examples/standalone-frontend` stub are removed. `check-design-consistency.mjs` takes file paths and flags 24px padding, 15px type, 16px radii, a 240px sidebar, a 22rem panel, raw Tailwind palette classes, hand-drawn SVG, an Inter (not InterVariable) family, and pure black.

## Issues

| ID | Sev | Description | Evidence | Files | Impact | Fix | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | HIGH | Instructions quoted a 14px title, 8px cards, padding `8/8/8/12`, and a 22px glyph for both docks | Selling dashboard computed style; `dock.scss` at v16.50 and v16.52 | `SKILL.md`, `references/typography.md`, `dashboards.md`, `navigation.md`, `icons.md` | An agent following the skill would ship the wrong chrome | Rewritten against `measured-desk.md` | Fixed |
| 2 | HIGH | Lucide sprite nested a full `<svg>` inside each `<symbol>`, so icons did not paint | Screenshot of the record form before the rebuild; geometry test negative case | `assets/icons/lucide-sprite.svg` | Every static example looked icon-less | Symbol bodies copied from `lucide-static` 1.53.0 | Fixed |
| 3 | HIGH | Mode B inherited Frappe UI's 16px/400 body, 20px page gutter, and a transparent dark sidebar | `parity-users.json` first runs | `examples/standalone-vue/src/style.css` | A Vue page would not match Desk even with the right components | Overrides listed in `SKILL.md`; dark and light pairs pass | Fixed |
| 4 | MEDIUM | Dialog backdrop was `rgba(0,0,0,0.4)` | Pixel diff 90.9% on the modal page; `modal.scss` and `$modal-backdrop-bg` | `assets/templates/shell.css` | Dialogs looked lighter than Desk | `rgba(56,56,56,0.8)`. Diff 3.3% | Fixed |
| 5 | MEDIUM | At 390 the list stayed one line, checkboxes stayed 14px, and the open drawer was white | `parity-mobile.json` first run; `list.scss` and `css_variables.scss` | `shell.css`, `examples/detail-view/index.html`, `shell.js` | Phone layout did not match Desk | 67px row, 15px list checkbox, 18px form checkbox, 20px menu button, drawer on `--desk-sidebar-bg` | Fixed |
| 6 | MEDIUM | Consistency script banned weight 420's neighbours and could not take paths. It also treated radius 16 as the only illegal radius while cards are 12 | Script source | `scripts/check-design-consistency.mjs` | The check would pass a 14px-title page and fail a correct header | Rules rewritten. A sample bad file fails all seven | Fixed |
| 7 | MEDIUM | `compare-screenshots.mjs` required the removed `standalone-frontend` example | Script source | `scripts/compare-screenshots.mjs` | The documented check could not run | Deleted. `compare-pages.mjs` is the check | Fixed |
| 8 | LOW | Checked checkbox border reads `rgb(0,0,0)` in Desk because the rule is `border: none` | `parity-static.json` pair `check box` | spec `accept` | False failure if compared naively | Accepted, with the reason in the spec | Fixed |
| 9 | MEDIUM | v16.50 dock was never booted | This bench is v16.52 | `tokens/variables.css` default profile | A regression inside v16.50 hover or padding could ship | Source-checked. Live-checked only through the v16.52 switch | Open |
| 10 | MEDIUM | Frappe CRM is not on the bench | No CRM app | `references/dashboards.md`, `tokens.json` `crm` | The 20×42 grid is source-only | Left as source. Not installed, to avoid an app and a migration | Open |
| 11 | LOW | Mobile drawer pixel diff stays high | `detail-view-390-drawer` ratio about 0.45 | example sidebar | Looks different beside Desk even though the box matches | Documented in `gap-report.md`. Not a geometry miss | Open |
| 12 | LOW | No automated contrast or screen-reader pass | No axe run | — | A contrast bug would not be caught | Focus rings and names are in the examples. Not a substitute for an audit | Open |

## Corrections

`shell.css` and `variables.css` carry the measured scale, including both dock profiles. The five static examples and the Vue example use that scale. `page.js` uses Desk's widgets. References listed in the issues table were updated so they no longer contradict `measured-desk.md`.

## Limitations

- CRM screens were not opened.
- v16.50 was not run as a site. ESS and Cargo docks were not re-measured in this pass; earlier notes say they follow the 40px tile, which matches the v16.50 target.
- The mobile list meta line is one field (department). Desk concatenates several columns with a bullet.
- Pixel diffs are not a pass/fail gate.

## Recommendations

- Boot a v16.50 bench when the next dock change lands, and add it as a second reference base in the parity spec.
- When CRM is available, add one parity page for the 20-column grid and the 35/65 side panel.
- Keep `compare-pages.mjs` as the gate. Do not bring back screenshot-only checks.

## Scores

Scores use the evidence in this file. A missing reference caps the score.

| | Area | Score | Why |
| --- | --- | --- | --- |
| A | Desk fidelity | 86 | Static pairs pass at 1440, in the dark, and at 390, including the v16.52 dock switch. Mobile drawer contents and the meta line are simpler than Desk |
| B | Frappe UI compatibility | 84 | Vue list, dashboard, and dark list pass, with the four accepted deltas named above |
| C | Component reuse | 82 | Mode A uses `WidgetGroup` and rendered real cards. Mode B uses Frappe UI. The static shell is a stylesheet, not a second component kit |
| D | Typography | 88 | Title 16/500, label 14/420, list head 400, value 17/600, InterVariable. Matched in the parity props |
| E | Spacing | 86 | 15px page gutter, card `12px 16px`, group gaps 15 and 40, sidebar group 18. CRM cell padding was not re-measured live |
| F | Navigation | 88 | Dock 57, sidebar 224, rows 28, both dock profiles. v16.50 hover comes from source, not from a live hover |
| G | Dashboard | 80 | Number card, value, and chart card pairs pass. Chart plot geometry was not compared. CRM grid is source-only |
| H | Interaction | 74 | Examples filter, select, and close on Escape. Hover and focus rings are specified. They were not a separate parity page |
| I | Accessibility | 68 | Named buttons, `aria-current`, focus rings, 20px menu target. No contrast tool and no screen reader |
| J | Maintainability | 84 | One token file, one shell, parity specs with notes, a consistency script that takes paths |
| K | Visual testing | 82 | Three specs, geometry test, icon negative test. Pixel diff is reported and not gated. No Playwright; puppeteer-core drove Chrome |
| L | Agent instruction quality | 85 | `SKILL.md` states the mode, the dock switch, and the Frappe UI overrides, and points at `measured-desk.md`. It is short enough to follow |

## Readiness

Use the skill for new Desk pages and for standalone Vue apps that must look like Desk v16.50, with the v16.52 dock available behind `data-dock="v16.52"`. Do not treat the CRM grid numbers as measured, and do not treat the v16.50 dock as live-verified.
