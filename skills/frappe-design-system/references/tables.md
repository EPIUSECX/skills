# Tables and lists

## Desk list

The User list at 1440×900 (`assets/screenshots/list-user-1440x900.png`):

- Header row: breadcrumbs, title, filter icon, sort icon, `+`
- Columns: ID, Full Name, Enabled, User Type
- Enabled is a dot, not a word
- Rows are compact. Token `--list-row-height: 30px`. Cell padding token `--grid-padding: 10px 8px`
- Measured `.list-row` box: x=303, y=133, width=1105, height=41. The 41px is measured, not the token. New tables use 30px.

Type: 14px, weight 420. Header labels are quieter (`--ink-gray-5`, 13px in the example tables).

## Selection and sort

A selected row uses `--surface-gray-2`. Sort is a header action, not a separate toolbar. Filters open from the header icon. Do not add a second filter row unless the page has more than two filters (the detail example does, because it is a management page).

## Density

Do not raise the row to 48px to "make it easier to tap" on desktop. Below 768px, the list can stack or the row can grow to 44px. That exception is only for touch widths.

## Mode B

Frappe UI list rows (`ItemListRow`) and a plain `<table>` with the classes in `assets/templates/shell.css` are both acceptable. Prefer the Frappe UI list when the page is a DocType list. Use the table when the page is a custom report.

## Empty and loading

An empty list is a short sentence and one solid button. A loading list is the Frappe UI spinner in the table body, not a skeleton the height of the page.
