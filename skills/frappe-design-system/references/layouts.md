# Layout recipes

Shell for every Mode B page: dock (optional) + 224px sidebar + 48px header + content. Content inset is 12px unless the recipe says otherwise. Max width of a reading column is `--page-max-width` (900px). Boards and tables use the full content width.

## 1. Enterprise dashboard

Header with the product name and one solid button. A row of four metric cards (8px gap, number-card padding). Under that, a 20×42 grid for charts and lists. Example: `examples/dashboard/index.html`.

## 2. Employee self-service dashboard

Same shell as ESS: dock, sidebar, header. The first band is the person (name, company) in a card with 12px padding, then the metric row (leave balance, attendance). Do not add a marketing hero. ESS `pages/Dashboard.vue` is the app-specific content. The shell rules still apply.

## 3. CRM pipeline

A header, a filter row (outline controls, 28px, gap 16px — this is the CRM exception), then columns of cards. Cards use 8px radius and a 1px border. Column gap 8px. Do not use a kanban library's default theme.

## 4. Record detail

One header row: breadcrumb, title, status badge, then outline Duplicate, previous, next, more, and solid Save. Under it, a 42px tab strip. The body is a two-column field grid (Desk `col-sm-6`) with 28px controls. The right column is the 277px form sidebar: an 80px letter tile, the title, Assign / Attachments / Tags / Share, then the edited and created lines. Example: `examples/record-form/index.html`, taken from the Item screenshot. The live User form is `assets/screenshots/form-user-1440x900.png`.

## 5. Master-detail

List on the left, 277px panel on the right, both under one header. Selecting a row sets `aria-selected` and fills the panel. Example: `examples/detail-view/index.html`.

## 6. Data management

Header tools: search (220×28), one filter, one solid "New". Table at 30px rows. Bulk actions appear in the header only when a row is selected.

## 7. Form workflow

Single column, max 900px, fields stacked with 6px between label and control and 16px between fields. Primary button at the bottom left, subtle Cancel beside it. Not a centered modal unless the task is a short dialog.

## 8. Settings

Sidebar section list (the module sidebar, not a second one) and a 900px form. ESS `components/settings/SettingsPage.vue` is the pattern: panels for profile, branding, preferences. Keep field geometry from forms.md.

## 9. Analytics

Same as the enterprise dashboard. Charts live in cards with 12px padding. Axis labels 12px `--ink-gray-5`. One chart per card.

## 10. Right-side context

See right-panels.md. Default to 277px.

## 11. Multi-step wizard

A 32px step row under the header (the Espresso stepper). The step body is the form workflow. Back is subtle, Next is solid. Do not show every step as a full page title.

## 12. Tabbed record

Tabs directly under the header, height 32px, 14px labels, the active tab is `--ink-gray-8` with a 2px bottom border in `--ink-gray-8`. Inactive is `--ink-gray-5`. The User form uses this. Do not put the tabs inside a card.

## Responsive

| Width | Change |
| --- | --- |
| ≥1200 | Dock + sidebar + panel |
| 768–1199 | Sidebar stays. Panel can move under the list |
| <768 | Hide dock and sidebar behind the Desk drawer. Panel becomes full width |

Desk breakpoints are in responsive.md. They are not the Tailwind defaults.
