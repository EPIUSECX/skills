# Spacing

## Espresso step

`--spacing: 0.25rem` (4px at a 16px root). Source: `css/espresso/spacing.css`.

Build component spacing as `calc(var(--spacing) * N)`. The button file does this.

| N | px | Used by |
| --- | --- | --- |
| 1 | 4 | Badge gap, sidebar row gap in CRM (`gap-1`) |
| 1.5 | 6 | Badge inline padding, button xs inline padding |
| 2 | 8 | Default button inline padding, card gap, CRM field gap (`gap-2`) |
| 2.5 | 10 | Button md inline padding |
| 3 | 12 | Dashboard grid padding (`p-3`), button lg inline padding |
| 5 | 20 | Default badge height |
| 6 | 24 | Button xs height |
| 7 | 28 | Button sm height, also the legacy `--input-height` and `--btn-height` |
| 8 | 32 | Button md height, sidebar row hit area used in the examples |
| 10 | 40 | Button lg height |

## Legacy Desk scale

`common/css_variables.scss` still defines a second scale. It is source-defined and still used by page and form chrome. Do not mix it into new Frappe UI utilities, but do not "fix" Desk pages that already use it.

| Token | px |
| --- | --- |
| `--padding-xs` / `--margin-xs` | 5 |
| `--padding-sm` | 7 |
| `--margin-sm` | 10 |
| `--padding-md` / `--margin-md` | 15 |
| `--padding-lg` / `--margin-lg` | 20 |
| `--padding-xl` / `--margin-xl` | 30 |
| `--padding-2xl` / `--margin-2xl` | 40 |

`.page-title` padding is `0 15px` (`page.scss`). That is `--padding-md`.

## Component padding from Espresso SCSS

`espresso/_spacing.scss`:

| Token | Value |
| --- | --- |
| `--input-padding` | `6px 8px` |
| `--dropdown-padding` | `4px 8px` |
| `--grid-padding` | `10px 8px` |
| `--number-card-padding` | `8px 8px 8px 12px` in Espresso. The Desk number card that renders is `12px 16px`. Use the measured padding |

## Page gutters

- Header content inset: 15px (legacy).
- Dashboard grid padding: 12px, then 8px inside each cell. Source: CRM `DashboardGrid.vue` (`p-3` on the scroller, `p-2` on the item) and ESS `.dash-grid`.
- Form sections: `--padding-md` (15px) on `.sidebar-section` in `form_sidebar.scss`.
- Do not put 24px or 32px of padding around a dashboard card. The rendered number card is `12px 16px`.

## Table cells

`--grid-padding: 10px 8px`. `--list-row-height: 30px`. The measured `.list-row` box on the User list was 41px tall. Use the 30px token for new rows. Do not copy 41px. The extra pixels were not traced to a padding token.
