# Controllers

Controllers add server-side logic to DocTypes via Python classes.

## File location

```
apps/<app>/<app>/<module>/doctype/<doctype_name>/<doctype_name>.py
```

## Basic controller

```python
import frappe
from frappe.model.document import Document

class Expense(Document):
    def validate(self):
        if self.amount <= 0:
            frappe.throw("Amount must be positive")

    def before_save(self):
        self.total = sum(item.amount for item in self.items)
```

The class name is the DocType name with spaces removed (e.g. "Expense Category" → `ExpenseCategory`).

## Document lifecycle hooks

Called in this order:

### On insert (new document)
1. `before_insert`
2. `before_naming` (before name is set)
3. `autoname` (custom naming logic — `self.name` is set after this)
4. `before_validate`
5. `validate`
6. `before_save`
7. (db insert)
8. `after_insert`
9. `on_update`
10. `on_change`

`autoname` is skipped when a Document Naming Rule has already set the name. There is no `after_save` hook.

### On update (existing document)
1. `before_validate`
2. `validate`
3. `before_save`
4. (db update)
5. `on_update`
6. `on_change`

### On submit (submittable DocTypes)
1. `before_validate`
2. `validate`
3. `before_submit` (`before_save` does not run on submit)
4. (db update)
5. `on_update`
6. `on_submit`
7. `on_change`

### On update after submit
1. `before_update_after_submit` (`before_validate` and `validate` do not run)
2. (db update)
3. `on_update_after_submit`
4. `on_change`

### On cancel
1. `before_cancel`
2. `on_cancel`
3. `on_change`

### On delete
1. `on_trash`
2. `on_change` (with `self.flags.in_delete = True`)
3. (link check, then db delete)
4. `after_delete`

Other hooks: `before_rename` / `after_rename`, and `before_discard` / `on_discard` for the v16 Discard action.

## Extending another app's DocType (v16)

Use the `extend_doctype_class` hook instead of `override_doctype_class`. Extensions stack in the method resolution order, so several apps can extend one DocType. Each overridden method must call `super()`.

```python
# hooks.py
extend_doctype_class = {"Sales Invoice": ["my_app.overrides.sales_invoice.SalesInvoiceMixin"]}
```

Set `export_python_type_annotations = True` in `hooks.py` to have Frappe write a typed field block into each controller when the DocType is saved in developer mode.

## Common patterns

### Set defaults before validation
```python
def before_validate(self):
    if not self.currency:
        self.currency = frappe.defaults.get_global_default("currency")
```

### Throw validation errors
```python
frappe.throw("Error message")                    # general error
frappe.throw("Message", frappe.ValidationError)  # with exception type
```

### Access current user
```python
frappe.session.user  # email of logged-in user
```

### Interact with other DocTypes
```python
def on_submit(self):
    frappe.get_doc(
        doctype="Notification Log",
        subject=f"Expense {self.name} approved"
    ).insert(ignore_permissions=True)
```

### Access flags
```python
# Skip validate and before_save (before_validate still runs)
doc.flags.ignore_validate = True
doc.save()
```

## Anti-patterns

- **Don't use `frappe.db.set_value` for fields with validation logic.** It bypasses `validate()`, `before_save()`, and all lifecycle hooks. Never use it for status fields or state transitions. Use it only for simple counters, timestamps, or cached values.
  ```python
  # BAD — skips controller validation
  frappe.db.set_value("Expense", name, "status", "Approved")
  # GOOD
  doc = frappe.get_doc("Expense", name)
  doc.status = "Approved"
  doc.save()
  ```
- **Don't call `frappe.db.commit()` in controller methods or request handlers.** See the Transactions section in [database](./database.md) reference. Inside a `doc_events` handler, commit and rollback are ignored with a warning.
- **Prefer `frappe.new_doc("Expense")` to `frappe.get_doc({...})` for new records.** `new_doc` applies field defaults, and v16 marks the dict form as not recommended.
- **Put permission checks inside controller methods**, not in API wrapper helpers. This ensures enforcement regardless of call path (API, desk, background job).
  ```python
  # BAD — check in api.py wrapper
  def _get_manager_doc(name):
      if "Expense Manager" not in frappe.get_roles(): ...
  # GOOD — check in the controller method itself
  class Expense(Document):
      @frappe.whitelist()
      def approve(self):
          if "Expense Manager" not in frappe.get_roles():
              frappe.throw("Not allowed", frappe.PermissionError)
  ```
- **Be consistent with permission checks across all controller methods.** If some methods on a DocType check for a role explicitly, all mutating methods should do the same — don't rely on implicit DocType perms for some and explicit checks for others.
