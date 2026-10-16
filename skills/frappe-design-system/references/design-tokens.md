# Design tokens

`tokens/tokens.json` is a machine extraction. `tokens/variables.css` is the subset the examples use.

## How a value is labeled

| Label | Meaning |
| --- | --- |
| Source-defined | Written in a Frappe CSS or SCSS file at a named commit |
| Measured | Read from `getComputedStyle` or `getBoundingClientRect` in Chrome |
| Inferred | A calc that follows from a source value, such as `0.25rem * 7 = 28px` at a 16px root |
| Unverified | Not measured and not read from source |

Nothing in `tokens.json` is an "official Frappe token" beyond the custom properties Frappe actually declares. The file records those declarations. It does not add new names and claim Frappe owns them.

## Where the declarations live

Espresso files say they are the source of truth:

- `frappe/public/css/espresso/spacing.css` — `--spacing: 0.25rem`
- `frappe/public/css/espresso/typography.css` — sizes and weights
- `frappe/public/css/espresso/colors.css` — palette plus `--surface-*`, `--ink-*`, `--outline-*`
- `frappe/public/css/espresso/radius.css`
- `frappe/public/css/espresso/effects.css` — elevations and focus rings

Desk layout tokens live in SCSS (`--sidebar-width`, `--page-head-height`, `--list-row-height`). They are layout, not part of the Espresso scale. The sidebar file says so.

`tokens.json` keeps the first declaration of each custom property (the light `:root`). Dark values are in the same files under `[data-theme="dark"]`. Do not treat a missing dark key as "same as light".

## Using them

In a Frappe UI app, import `frappe-ui/style.css`. That already defines the Espresso variables. Do not paste a second copy of the palette into the app.

In a fixture that cannot import Frappe UI, link `tokens/variables.css`.

`--font-weight-regular` is 420, not 400. The measured `font-weight` on the User list was 420.
