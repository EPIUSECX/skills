# Forms

## Control geometry

| Token | Value | Source |
| --- | --- | --- |
| `--input-height` | 28px | `common/css_variables.scss` |
| `--input-padding` | `6px 8px` | `espresso/_spacing.scss` |
| `--btn-height` | 28px | same file, legacy |
| Radius | 8px (`--radius`) | Espresso |
| Border | 1px `--outline-gray-2` | outline buttons and inputs |
| Focus | `--focus-outline-default` | `effects.css` |
| Label | 13px `--ink-gray-5`, 6px under the label (`gap-1.5` on the login form) | login HTML, measured page |
| Helper | 12px `--ink-gray-5` | |
| Error | `--red-500` text, `--focus-outline-red` on the control | button.css `aria-invalid` |

The login form (`/login`) is the live reference for a single column of fields: label, 28px control, 8px-scale gaps (`gap-1.5` and `gap-8` between groups). The submit button is `.es-button` `data-variant="solid"` and full width.

## Layout

Desk document forms are a two-column layout plus the 277px form sidebar. Do not wrap a DocType form in a custom card grid. Let the form layout render.

Section titles stay 14px medium. Do not insert a 24px heading between the page header and the first section.

## Validation

Show the message under the field, 12px, `--ink-red-6`. Move focus to the first invalid control. Do not use a toast as the only error.

## Mode A

Use DocField, a Dialog, or `frappe.ui.form`. Do not mount a Vue form over the Desk form.

## Mode B

Use Frappe UI `FormControl`, `TextInput`, `Select`, `Autocomplete` / `Combobox`, `DatePicker`, `Checkbox`. Map DocField types to those controls. Keep the 28px height. `FormLabel` is the label.

## Checkbox

`--checkbox-size: 14px` (18px below the `md` breakpoint). Source: `css_variables.scss`.
