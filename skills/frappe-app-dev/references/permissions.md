# Permissions

## DocType-level permissions

Define in the DocType JSON under `permissions`:

```json
{
    "permissions": [
        {
            "role": "System Manager",
            "read": 1, "write": 1, "create": 1, "delete": 1, "submit": 0, "cancel": 0
        },
        {
            "role": "Expense User",
            "read": 1, "write": 1, "create": 1, "delete": 0
        }
    ]
}
```

Permission types: `select`, `read`, `write`, `create`, `delete`, `submit`, `cancel`, `amend`, `print`, `email`, `share`, `export`, `import`, `report`, and `mask` (see masked values). These are not permission levels: `permlevel` (0-9) is a separate field that groups fields.

## Custom roles

Create a Role DocType JSON:
```json
{
    "name": "Expense User",
    "doctype": "Role",
    "desk_access": 1,
    "is_custom": 0
}
```

Migrate does not import a Role JSON file by default. It imports `apps/<app>/<app>/<module>/role/expense_user/expense_user.json` only if `hooks.py` has `importable_doctypes = ["Role"]`. The usual way is fixtures:

Or use fixtures in `hooks.py`:
```python
fixtures = [
    {"dt": "Role", "filters": [["name", "in", ["Expense User", "Expense Manager"]]]}
]
```

## Programmatic permission checks

```python
# Check if current user has permission
frappe.has_permission("Expense", "read")
frappe.has_permission("Expense", "write", doc="EXP-0001")

# Throw if no permission
frappe.has_permission("Expense", "write", throw=True)

# Check for specific user
frappe.has_permission("Expense", "read", user="john@example.com")
```

## Bypassing permissions

```python
# Insert without permission checks
doc.insert(ignore_permissions=True)

# flags approach
doc.flags.ignore_permissions = True
doc.save()

# Run as Administrator
frappe.set_user("Administrator")
# ... do work ...
frappe.set_user(original_user)
```

Use `ignore_permissions` only in server-side background logic, never in user-facing APIs.

## User-based filtering (owner permissions)

Add `"if_owner": 1` to a permission rule to restrict users to their own documents:
```json
{
    "role": "Expense User",
    "read": 1, "write": 1,
    "if_owner": 1
}
```

## `has_permission` hook

Register the check in `hooks.py`. Do not define `has_permission` on the controller class: that overrides `Document.has_permission`, skips the role checks, and is not called by `frappe.has_permission`, list views or `get_list`.

```python
# hooks.py
has_permission = {
    "Expense": "myapp.permissions.expense_has_permission",
}
```

```python
# myapp/permissions.py
def expense_has_permission(doc, ptype, user):
    if ptype == "read" and doc.department != get_user_department(user):
        return False
    return True  # required: None also denies
```

The hook can only deny. It cannot grant a permission the roles do not give. Any falsy return, `None` included, denies, so return `True` explicitly. The hooks of all apps run, and the `"*"` key applies to every DocType.

## Row-level filtering on list views (`get_query_conditions`)

To restrict which records appear in list views and `get_list` calls, define `permission_query_conditions` in `hooks.py`:

```python
# hooks.py
permission_query_conditions = {
    "Expense": "myapp.permissions.expense_query_conditions",
}
```

```python
# myapp/permissions.py
import frappe

def expense_query_conditions(user=None):
    if not user:
        user = frappe.session.user
    if "Expense Manager" in frappe.get_roles(user):
        return ""  # no restriction
    return f"`tabExpense`.`owner` = {frappe.db.escape(user)}"
```

Return a SQL WHERE clause fragment (string). Any falsy return (`""`, `None`, `False`) adds no condition, so it means no restriction. To deny all rows, return `"1=0"`.

The handler is called as `(user, doctype=...)`. The `"*"` key applies to every DocType. Permission Query server scripts add their conditions too.

`frappe.get_all` and `frappe.db.get_all` skip these conditions. Only `frappe.get_list` applies them.

Pair with `has_permission` for complete coverage — `permission_query_conditions` filters lists, `has_permission` guards individual documents.
