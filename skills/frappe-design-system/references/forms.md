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

## Document form, measured

The User form and the Item form in the reference screenshot share this chrome. Numbers are from the User form at 1440×900 (`references/visual-audit/form-anatomy.json`) unless noted.

| Piece | Measured | Source |
| --- | --- | --- |
| Page head border box | 49px (x=281) | token 48px plus the bottom border |
| Tab strip `.form-tabs-list` | y=49, height 42, radius `10px 10px 0 0`, width 871 (stops at the sidebar) | `form.scss` |
| Tab link | padding `10px 0`, horizontal margin 15px (`--margin-md`) | `form.scss` |
| Active tab | 1px bottom border, computed weight 400 | the rule literally sets `font-weight: 400`. New UI keeps weight 420 |
| Inactive tab | `--text-light` | |
| Section body | padding-top 12px | `.form-section > .section-body:first-child` |
| Columns | a `col-sm-12` section, then `col-sm-4` columns at 280px | Bootstrap 12-column grid. The Item screenshot uses two `col-sm-6` columns |
| Read-only control | height 28px, padding `6px 8px`, radius 8px, fill `--surface-gray-2` | input tokens. The Rename dialog input measured 28×543 with that padding |
| Form sidebar | x=1153, width 277 | `--form-sidebar-width` |
| Letter mark | 80×80, radius `--radius-lg` (12px), initials at 40px | `.standard-image` in `form_sidebar.scss`. Hidden when the record has no image (`sidebar-image hide` measured 0×0 on User) |

The header holds the breadcrumb, the document title, the status badge, and the actions (outline Duplicate, previous, next, more, solid Save) on one 48px row. Do not add a second title under the tabs.

`examples/record-form/index.html` is that page, using the Item screenshot as the content.

## Dialog

A `frappe.ui.Dialog` titled Rename, measured at 1440×900 (`references/visual-audit/modal.json`, `assets/screenshots/modal-1440x900.png`):

| Piece | Value |
| --- | --- |
| `.modal-dialog` width | 575px (`$modal-md` in `desk/variables.scss`). x=433, y=28 |
| `.modal-content` | radius 12px, shadow `0 5px 10px rgba(0,0,0,0.1)`, background white |
| Header | padding `7px 15px`, height 47 |
| Body | padding 15px |
| Primary button | 28px tall, background `#171717`, radius 8px |
| Open / close | transform 0.2s ease (`modal.scss`) |

`$modal-sm` is 450px. Below the `sm` breakpoint the dialog becomes full width. `examples/modal/index.html` uses the 575px size.

## Search

Ctrl+K calls `frappe.app.awesome_bar.open()` (`search_utils.js`). The shortcut did nothing from Puppeteer until that method was called. The open dialog is the same 575px modal (`references/visual-audit/search.json`):

- Input `#navbar-search`: 28px tall, padding `6px 8px`, radius 8px, width 529 inside the dialog
- Footer `.awesomebar-modal-footer`: height 40, padding 10px, 12px type
- Placeholder from source: "Search or type a command"
- Ctrl+G opens global search. Ctrl+K toggles the awesome bar

## Validation

Show the message under the field, 12px, `--ink-red-6`. Move focus to the first invalid control. Do not use a toast as the only error.

## Mode A

Use DocField, a Dialog, or `frappe.ui.form`. Do not mount a Vue form over the Desk form.

## Mode B

Use Frappe UI `FormControl`, `TextInput`, `Select`, `Autocomplete` / `Combobox`, `DatePicker`, `Checkbox`. Map DocField types to those controls. Keep the 28px height. `FormLabel` is the label.

## Checkbox

`--checkbox-size: 14px` (18px below the `md` breakpoint). Source: `css_variables.scss`.
