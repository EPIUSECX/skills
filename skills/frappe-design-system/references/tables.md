# Tables and lists

## Desk list

The User list at 1440×900 (`assets/screenshots/list-user-1440x900.png`):

- Header row: breadcrumbs, title, filter icon, sort icon, `+`
- Columns: ID, Full Name, Enabled, User Type
- Enabled is a dot, not a word
- `--list-row-height: 30px` styles `.list-row-head` only. A data `.list-row` does not use it.
- Measured data row at 1440, 1280, and 1920: border box 41px. The children are 40px (`.level-left` padding `5px 0`, `.level-right` padding `9px 10px`, line-height 21px) plus a 1px bottom border. Trace: `references/visual-audit/list-row-trace.json`.
- At 390×844 the same row measured 67px tall. `--grid-padding: 10px 8px` is the grid form, not this list.

Type: 14px. The row is weight 420. The subject link is weight 600 and `--ink-gray-8`. Header labels are 14px, weight 400, `--ink-gray-6`. Below 576px the row is 67px and grows a 14px meta line (`list.scss`).

## Selection and sort

A selected row uses `--surface-gray-2`. Sort is a header action, not a separate toolbar. Filters open from the header icon. Do not add a second filter row unless the page has more than two filters (the detail example does, because it is a management page).

## Density

A recreated Desk list uses a 30px header and a 41px data row. Do not squash the data row to 30px, and do not grow it to 48px on desktop. At 390px the running list measured 67px. That is observed, not a new token.

## Mode B

Frappe UI list rows (`ItemListRow`) and a plain `<table>` with the classes in `assets/templates/shell.css` are both acceptable. Prefer the Frappe UI list when the page is a DocType list. Use the table when the page is a custom report.

## Empty and loading

An empty list is a short sentence and one solid button. A loading list is the Frappe UI spinner in the table body, not a skeleton the height of the page.
