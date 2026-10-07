# DocTypes

DocTypes are the core data model in Frappe. Each DocType becomes a database table and gets auto-generated CRUD APIs, forms, and list views.

## Creating a DocType

Write these files, then run `bench migrate`. Migrate imports the JSON but creates no files. Without the controller class, loading the DocType raises `ImportError`.

```
apps/<app>/<app>/<module>/doctype/<doctype_name>/
  __init__.py            (empty)
  <doctype_name>.json
  <doctype_name>.py      (class <DocTypeName>(Document): pass)
```

Or create the DocType in the desk on a developer-mode site. Frappe then writes the JSON, the controller, the JS file, and a test file.

File path: `apps/<app>/<app>/<module>/doctype/<doctype_name>/<doctype_name>.json`

Minimal example:
```json
{
    "name": "Expense",
    "module": "Expense Tracker",
    "doctype": "DocType",
    "engine": "InnoDB",
    "fields": [
        {
            "fieldname": "title",
            "fieldtype": "Data",
            "label": "Title",
            "reqd": 1
        },
        {
            "fieldname": "amount",
            "fieldtype": "Currency",
            "label": "Amount",
            "reqd": 1
        },
        {
            "fieldname": "status",
            "fieldtype": "Select",
            "label": "Status",
            "options": "Draft\nApproved\nRejected",
            "default": "Draft"
        }
    ],
    "autoname": "EXP-.####",
    "naming_rule": "Expression",
    "is_submittable": 0,
    "permissions": [
        {
            "role": "System Manager",
            "read": 1,
            "write": 1,
            "create": 1,
            "delete": 1
        }
    ]
}
```

Also create an empty `__init__.py` alongside the JSON:
```
apps/<app>/<app>/<module>/doctype/<doctype_name>/__init__.py
```

## Common field types

| fieldtype | Use for |
|-----------|---------|
| Data | Short text (140 chars) |
| Small Text | Multi-line text |
| Text Editor | Rich text (HTML) |
| Int / Float | Number |
| Currency | Money amounts |
| Date / Datetime | Date, or date with time |
| Select | Dropdown (options separated by `\n`) |
| Link | Foreign key to another DocType |
| Table | Child table (one-to-many) |
| Check | Boolean (0/1) |
| Attach | File attachment |

## Naming patterns

- `autoname: "EXP-.####"` with `naming_rule: "Expression"` — sequential (EXP-0001, EXP-0002)
- `autoname: "format:EXP-{####}"` — the old style. On save, v16 sets `naming_rule` to "Expression (old style)" and warns that `format:` is discouraged.
- `autoname: "field:title"` — use field value as name (an empty field raises "{label} is required")
- `autoname: "autoincrement"` — integer names from a database sequence. You cannot change away from it later.
- `autoname: "UUID"` — UUID v7
- `autoname: "hash"` — random hash
- `autoname: "naming_series:"` — user-configurable series
- `autoname: "prompt"` — user enters name manually

A Document Naming Rule, when one matches, runs before the controller's `autoname()` method, and `autoname()` is then skipped.

## Child DocTypes

For one-to-many relationships (e.g. Expense Items inside an Expense):

1. Create a child DocType JSON with `"istable": 1`
2. Add a `Table` field in the parent pointing to it:
```json
{
    "fieldname": "items",
    "fieldtype": "Table",
    "label": "Items",
    "options": "Expense Item"
}
```

A child DocType needs no permissions. It inherits them from the parent.

## After creating/modifying DocTypes

Always run:
```bash
bench --site <site> migrate
```

Migrate re-imports a DocType JSON when its content hash changes, so a hand edit is picked up. Other JSON files (Workspace, Report, Sidebar, ...) are re-imported only when `modified` is newer than the database row.

## Other useful JSON keys

```json
{
    "sort_field": "creation",       // default sort column for list view (default: creation)
    "sort_order": "DESC",           // ASC or DESC
    "track_changes": 1,             // enable version history / timeline
    "is_submittable": 1             // enables Submit → Cancel → Amend workflow
}
```

Every DocType has a standard `docstatus` column: `0` = Draft, `1` = Submitted, `2` = Cancelled. Submittable DocTypes also get an `amended_from` Link field. Users cannot edit submitted documents — they must cancel and amend.

Do NOT add `creation`, `modified`, `owner`, `modified_by`, or `docstatus` as fields — Frappe creates these automatically.
