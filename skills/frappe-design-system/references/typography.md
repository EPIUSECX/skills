# Typography

Source: `frappe/public/css/espresso/typography.css` and the font stack in `frappe/public/scss/espresso/_typography.scss`. Same file at v16.50.0 and v16.52.0.

## Stack

```
InterVariable, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif
```

Measured computed family on the User list starts with `InterVariable`. Weight 420. Size 14px. Line-height 21px (14 × 1.5).

## Weights

| Token | Value |
| --- | --- |
| `--font-weight-regular` | 420 |
| `--font-weight-medium` | 500 |
| `--font-weight-semibold` | 600 |
| `--font-weight-bold` | 700 |
| `--font-weight-black` | 800 |

UI labels and buttons use regular (420) at the `sm` button size. The `md` button steps up to medium (500). Do not set body text to 400.

## Sizes you will actually use

| Token | px | Use |
| --- | --- | --- |
| `--text-2xs` / `--text-tiny` | 11 | Rare. Badges do not use this. |
| `--text-xs` | 12 | Button xs, badge text is `0.75rem` (also 12px) |
| `--text-sm` | 13 | Sidebar rows in CRM (`text-sm`), helper text |
| `--text-base` | 14 | Body, default button, list cells, field values |
| `--text-lg` | 16 | Panel title |
| `--text-xl` | 17 | Large button |
| `--text-3xl` | 20 | Metric value |

The file continues to 56px (`--text-12xl`). Desk screens do not use those sizes for chrome. Do not put a 32px title in a page header. The header is 48px tall and the title is 14px medium.

## Line height and tracking

Single-line UI classes (`.text-base` and the sizes through `.text-5xl`) use `line-height: 1.15`. Paragraph classes (`.text-p-base`) use 1.5. The measured page inherited 21px, which is the paragraph line height on 14px, from the body.

Letter-spacing on `.text-base` is `0.015em`. The SCSS map still has older values (`base: 0.02em`). New markup should use the CSS classes, which the SCSS file calls the source of truth.

## Hierarchy for a page

| Role | Style |
| --- | --- |
| Page title (breadcrumb) | 16px, weight 500, current crumb `--ink-gray-9`, parent `--ink-gray-5` |
| Section title | 14px, weight 500 |
| Sidebar row | 13px, weight 420, `--ink-gray-6` |
| Field label | 14px, weight 420, `--ink-gray-6`, 6px above the control |
| Field value | 14px, `--ink-gray-8`. Required input text is weight 600 |
| List header label | 14px, weight 400, `--ink-gray-6` |
| Form tab | 14px, weight 400 |
| Meta / helper | 12px, `--ink-gray-5` |
| Metric number | 17px, weight 600, line-height 1.35, `--ink-gray-8` |
