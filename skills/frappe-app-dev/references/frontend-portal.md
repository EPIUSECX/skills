# Portal Pages (Public Website)

Server-rendered Jinja templates for public-facing pages.

## Jinja templates

File: `apps/<app>/<app>/www/<page_name>.html`

```html
{% extends "templates/web.html" %}
{% block page_content %}
<h1>Expenses</h1>
{% for expense in expenses %}
<div>{{ expense.title }} — {{ expense.amount }}</div>
{% endfor %}
{% endblock %}
```

Context via Python:
File: `apps/<app>/<app>/www/<page_name>.py`

```python
import frappe

no_cache = 1  # required: the page cache is keyed by path, not by user

def get_context(context):
    context.expenses = frappe.db.get_all("Expense",
        filters={"owner": frappe.session.user},
        fields=["title", "amount"])
```

Without `no_cache = 1`, a page that shows per-user data is cached for every visitor (30 minutes when `developer_mode` is off), so one user sees another user's data.

## Portal settings

In `hooks.py`:
```python
website_route_rules = [
    {"from_route": "/expenses", "to_route": "Expense"},
]

has_website_permission = {
    "Expense": "myapp.permissions.has_website_permission"
}
```

The `{"from_route": "/expenses", "to_route": "Expense"}` rule renders a list only if the DocType has `has_web_view` set, or its module defines `get_list_context`.

The permission hook is called as `has_website_permission(doc, ptype, user, verbose)`. Any falsy return denies access.
