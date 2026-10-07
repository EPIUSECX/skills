# Desk UI (Client Scripts)

Frappe auto-generates Desk forms and list views for each DocType. Usually no custom UI code is needed.

## Client scripts

Add client-side logic to DocType forms:

File: `apps/<app>/<app>/<module>/doctype/<doctype>/<doctype>.js`

```javascript
frappe.ui.form.on("Expense", {
    // When form loads
    refresh(frm) {
        if (frm.doc.status === "Draft") {
            frm.add_custom_button("Submit", () => {
                frm.savesubmit();  // standard confirm dialog and client submit events
            });
        }
    },

    // When a field value changes
    amount(frm) {
        frm.set_value("tax", frm.doc.amount * 0.1);
    },

    // Before save
    validate(frm) {
        if (frm.doc.amount <= 0) {
            frappe.throw("Amount must be positive");
        }
    }
});
```

## Child table events

```javascript
frappe.ui.form.on("Expense Item", {
    // When a row field changes
    item_amount(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        frappe.model.set_value(cdt, cdn, "tax", row.item_amount * 0.1);
        calculate_total(frm);
    },

    // When a row is removed
    items_remove(frm) {
        calculate_total(frm);
    }
});

function calculate_total(frm) {
    let total = 0;
    frm.doc.items.forEach(row => { total += row.item_amount; });
    frm.set_value("total", total);
}
```

## Common client API

```javascript
// Call server method
frm.call("get_summary").then(r => console.log(r.message));

// Call whitelisted API
frappe.call({
    method: "myapp.api.get_expenses",
    args: { status: "Draft" },
    callback(r) { console.log(r.message); }
});

// Promise form: resolves to r.message
const expenses = await frappe.xcall("myapp.api.get_expenses", { status: "Draft" });

// Navigate: use set_route, never build URL strings
frappe.set_route("List", "Expense");

// Show dialog
frappe.prompt("Enter reason", (values) => {
    console.log(values.value);
});

// Show message
frappe.msgprint("Done!");
frappe.show_alert({ message: "Saved", indicator: "green" });

// Set field properties
frm.set_df_property("amount", "read_only", 1);
frm.toggle_display("notes", frm.doc.status === "Rejected");

// Set query filter for Link field
frm.set_query("category", () => {
    return { filters: { "enabled": 1 } };
});
```

## List view settings

File: `<doctype_folder>/<doctype>_list.js`, loaded with the list view.

```javascript
frappe.listview_settings["Expense"] = {
    add_fields: ["status"],
    get_indicator(doc) {
        if (doc.status === "Approved") return [__("Approved"), "green", "status,=,Approved"];
    },
};
```

## Desk routes and theme (v16)

- Desk URLs start with `/desk/`. `/app/...` only redirects. Use `/desk/...` in `app_home`, links and the Apps-screen `route`.
- The desk opens a page or list inside its module's shell and rewrites the URL to `/desk/<shell>/<page-or-doctype>`.
- `<html data-theme>` holds the resolved `light` or `dark`. `data-theme-mode` holds the user's choice and can be `automatic`.
- Color tokens are scoped to `[data-theme="light"]` and `[data-theme="dark"]`. Use `--surface-base`, `--surface-gray-*` and `--ink-gray-*`. `--surface-white` does not exist on v16.50.

## Raw desk JS files

A file in `app_include_js` listed by raw path (not a `.bundle.js`) has no version query and browsers cache it for up to 12 hours. Use a bundle, or expect users to hard-refresh after a deploy.

Desk JS from one app runs on every page of every app. Never replace a framework method such as `frappe.app.sidebar.set_workspace_sidebar`. The patch breaks other apps and the next desk release.
