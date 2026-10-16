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

Measured on `/desk/dashboard-view/Selling`. This is not the Espresso `--number-card-padding` token (`8px 8px 8px 12px`), which the running card does not use.

- Padding `12px 16px`
- Label: 13px `--ink-gray-5`
- Value: 17px, weight 600, line-height 1.35
- Gap inside the card: 6px
- Border: 1px `--outline-gray-1`
- Radius: 12px
- No resting shadow
- Cards in one group: 15px apart. The next `.widget-group` starts 40px below

Three cards across at 1440. One column below 768px. A chart card is padding 7px, radius 12px, title 14px / 500.

## Workspace cards

The Accounting workspace onboarding widget measured 864×589, padding `16px 12px`, radius 12px. That padding belongs to the onboarding widget. Number cards stay at `12px 16px`. Chart cards stay at 7px.

## Mistakes

- A metric with 24px padding and a 32px number
- A single card stretching to `--page-max-width` (900px) with empty margins on a 1440px screen. The board uses the content width.
- Mixing 16px gaps and 8px gaps in the same board
- A shadow under every card
