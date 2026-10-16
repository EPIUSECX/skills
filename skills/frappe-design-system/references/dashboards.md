# Dashboards

Compact. The page header is the title. The board starts 12px under it.

## CRM grid (verified)

Source: `frappe/crm` `frontend/src/components/Dashboard/DashboardGrid.vue` at `47bb9417bd74`.

- `grid-layout-plus`
- `:col-num="20"`
- `:row-height="42"`
- Breakpoints in the component: lg/md/sm 20 columns, xs/xxs 1 column
- Scroller padding `p-3` (12px)
- Item padding `p-2` (8px)
- Filter row above the grid: `p-5 pb-2` (20px, then 8px) with `gap-4` (16px). That row is the exception: it is CRM's own header, and the controls are `w-48` outline dropdowns.

ESS copies this grid in `frontend/src/style.css` (`.dash-grid`). That part matches CRM. Keep it.

## Metric card

Padding `--number-card-padding: 8px 8px 8px 12px`.

- Label: 13px `--ink-gray-5`
- Value: 20px weight 500
- Hint: 12px `--ink-gray-5`
- Border: 1px `--outline-gray-1`
- Radius: 8px
- No shadow

Four metrics in one row, 8px gap. On a 768px window, two columns. On a 390px window, one column.

## Workspace cards

Desk workspace cards (links, charts, shortcuts) use the same border and radius. A chart sits in a card with 12px padding, not in a hero panel.

## Mistakes

- A metric with 24px padding and a 32px number
- A single card stretching to `--page-max-width` (900px) with empty margins on a 1440px screen. The board uses the content width.
- Mixing 16px gaps and 8px gaps in the same board
- A shadow under every card
