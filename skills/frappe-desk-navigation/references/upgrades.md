# Upgrades: Apps Already on Live Sites

## A fixture file imports only when `modified` is newer

`bench migrate` imports a Workspace, Sidebar, Dock, or other JSON fixture only when the `modified` value in the file is newer than the database row. If you change an icon or `standard` in the file and do not change `modified`, git shows the change, but no existing site gets it.

Do one of these:

- Change the record on a developer-mode site. `doc.save()` writes the file with a new `modified`.
- Set the top-level `modified` in the file to the current time.

Then migrate and run `scripts/check_imported.py`.

Sometimes a site must keep its own edits. For example, a live site may have changed a workspace's content. In that case, do not change `modified`. Change the database with a patch instead.

## Move a workspace to another module

1. Move the folder to `<module>/workspace/<name>/` with `git mv`.
2. Change `"module"` in the JSON. Remove the old `"app"` key if it is there.
3. Do not change `modified`. A newer file replaces the content that each site has edited.
4. Add a `post_model_sync` patch:
   ```python
   def execute():
   	if frappe.db.get_value("Workspace", "<name>", "module") == "<old module>":
   		frappe.db.set_value("Workspace", "<name>", "module", "<new module>", update_modified=False)
   ```

New sites import the file from its new place.

## The v16 migration can hide the whole rail

Symptom: the rail shows one entry, `<Area> (Custom)`. A click opens an old sidebar with the same icon on every row. A fresh install looks correct, because the cause is site data.

Cause: the site had a Workspace Sidebar that a user made (`standard: 0`). During the upgrade, `frappe/patches/v16_0/convert_custom_sidebars.py` did these things:

- It made a custom Module Def named `<title>` or `<title> (Custom)`, with its own Sidebar and Block Module rows.
- `move_custom_sidebar_workspaces.py` moved the matching workspace into that module.
- It saved a site Dock layer for the app with the rail as it was at that time, plus the new entry.

If the app had no Dock yet, the layer holds only the custom entry. A saved layer is the whole rail, so it hides every entry that the app ships.

Diagnose on the site:

```python
from frappe.desk.doctype.dock.dock import resolve_app_dock
[e.get("title") for e in resolve_app_dock("<app>")]
frappe.get_all("Dock", {"app": "<app>"}, ["name", "standard", "user"])  # standard 0 is a site layer
frappe.get_all("Module Def", {"custom": 1, "app_name": "<app>"}, pluck="name")
```

Fix it in the app, so each site repairs itself at the next migrate:

1. Copy `scripts/repair_migrated_custom_sidebars.py` into the app's patches.
2. Set `APP`.
3. List it under `[post_model_sync]`, after the shipped Sidebars are imported.

The patch removes only modules named `<shipped Sidebar title> (Custom)` or `... (Custom) N`, with their sidebars and Block Module rows. It moves their workspaces back. It removes the site Dock layer only if every entry in it points at such a module, so a dock that someone arranged stays.

A stopgap for one site is Manage Dock, then reset for everyone. It leaves the custom module and the moved workspace in place.

## Delete old desk workarounds

Look for these and delete each one with its entry in `hooks.py` or `patches.txt`:

- the `workspace_sidebar/` folder.
- patches that point a Desktop Icon at a Workspace Sidebar.
- desk JS that calls `frappe.app.sidebar.show_sidebar_for_module`. 16.50 does not have this method, so the code returns at once. 16.50 maps a Page to its module's shell itself, and `frappe.boot.page_info` already holds each page's `module`. Also delete boot hooks that only fed such code.
- `frappe.router.routes[slug] = {doctype}` lines. `router.setup()` adds a route for each DocType in `frappe.boot.user.can_read`.
- scripts that replace `set_workspace_sidebar`. See [verify.md](./verify.md).
- hooks that rename another app's grid icon on each migrate. On a site on the Apps screen, that icon does not exist. Other apps that use the old name as `parent_icon` then fail to install.
- tests that import an override module that no longer exists.
- code that creates `Workspace Sidebar` records at runtime. On 16.50 they do nothing, and on older sites they feed the migration above.

To find them:

```bash
grep -rn "Workspace Sidebar\|Desktop Icon\|set_workspace_sidebar\|show_sidebar_for_module\|router.routes\[" <app> --include=*.py --include=*.js
```

Remove this code only if the app does not have to run on a v16 minor release before 16.50.

## Uninstall a test install

`bench --site <site> uninstall-app <app> --yes` is safe on a developer-mode site. Frappe deletes the records with `ignore_on_trash=True`, so it removes no source folders. Run `git status` to be sure.

Uninstall leaves the app's Dock row, because a Dock belongs to the app, not to a module. Delete it directly so no hook writes the file:

```python
frappe.db.delete("Dock Item", {"parent": "<app>", "parenttype": "Dock"})
frappe.db.delete("Dock", {"name": "<app>"})
frappe.cache.delete_value("dock_layers")
frappe.clear_cache()
```
