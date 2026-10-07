# File formats (as shipped by ERPNext and a converted custom app, Frappe 16.50)

All JSON uses `indent=1`. Sidebar exports are `sort_keys=True` with a trailing newline, which matches
what the converter and `export_to_files` write. Let Frappe write these files (developer mode)
wherever it can, and hand-edit only to refine them.

## Paths at a glance

```
<app>/
├── hooks.py                                   add_to_apps_screen, app_include_icons
├── permissions.py                             has_app_permission()
├── dock/<app>/<app>.json                      Dock (one per app; name == app)
├── <module>/sidebar/<scrub(title)>/<scrub(title)>.json   Sidebar (one or more per module)
├── <module>/workspace/<ws>/<ws>.json          Workspace page (standard: 1)
├── public/images/<app>-logo.svg               Apps-screen tile
├── public/icons/module-icons.svg              -duotone symbols
└── desktop_icon/*.json                        retiring icon grid only (App + Link icons)
```

## Dock: `<app>/dock/<app>/<app>.json`

```json
{
 "app": "my_app",
 "doctype": "Dock",
 "name": "my_app",
 "standard": 1,
 "user": "",
 "items": [
  {
   "added": 1,
   "hidden": 0,
   "icon": "myapp-gear-duotone",
   "link_to": "My Workshop",
   "link_type": "Sidebar",
   "title": "Workshop"
  }
 ]
}
```
- `link_type`: `Sidebar` (a module rail button, `link_to` = Sidebar title or Module Def),
  `Workspace` (a pin), or `URL`. **Avoid `URL` on 16.50**: the rail opens every entry with
  `frappe.set_route`, so `/portal` becomes `/desk/portal`. Put external or portal links in the
  Sidebar as a URL item with `open_in_new_tab: 1` (see the Sidebar section).
- A standard dock needs `icon` **and** `title` on every row (`Dock.validate_added_rows`).
- Rows appear on the rail in the order listed. Use `hidden: 1` for "off by default, the site can enable". An entry
  that is not listed can never appear.
- Companion app: add `"mount_on": "<host_app>"`. Its rows are appended to the host's rail, and the
  app is dropped from the Apps screen.
- ERPNext's dock has 12 rows, one per module Sidebar. A single-module app normally has one row.

## Sidebar: `<app>/<module>/sidebar/<scrub(title)>/<scrub(title)>.json`

```json
{
 "app": "my_app",
 "doctype": "Sidebar",
 "header_icon": "myapp-gear-duotone",
 "module": "My App",
 "name": "My Workshop",
 "standard": 1,
 "title": "My Workshop",
 "items": [
  {"type": "Link", "label": "Home", "link_type": "Workspace", "link_to": "My Workshop", "icon": "house", "idx": 1},
  {"type": "Link", "label": "Jobs", "link_type": "DocType", "link_to": "Project", "icon": "folder-kanban", "idx": 4},
  {"type": "Section Break", "label": "Reports", "icon": "sheet", "indent": 1, "keep_closed": 0, "idx": 7},
  {"type": "Link", "label": "Job Profitability", "link_type": "Report", "link_to": "Job Profitability", "child": 1, "idx": 8},
  {"type": "Section Break", "label": "Setup", "icon": "database", "indent": 1, "keep_closed": 1, "idx": 11},
  {"type": "Link", "label": "Demo Settings", "link_type": "DocType", "link_to": "My App Settings", "child": 1, "idx": 12}
 ]
}
```
(The rows are abbreviated. The converter also writes `doctype/parentfield/parenttype` and the boolean
flags on each row.)
- `name` = `title` (`autoname: field:title`), and the folder and file name are `scrub(title)`.
- Item `type`: `Link`, `Section Break` or `Spacer`. Item `link_type`: `DocType`, `Page`, `Report`,
  `Workspace`, `Dashboard` or `URL`. Optional `filters` and `route_options` hold JSON.
- A section header (`indent: 1`) carries the icon. Its rows (`child: 1`) carry none.
- `keep_closed: 1` collapses a section by default (ERPNext does this for Setup and Reports).
- Portal or external links: `{"type": "Link", "link_type": "URL", "url": "/portal", "label": "Member Portal",
  "icon": "square-arrow-out-up-right", "open_in_new_tab": 1}`. It renders as `<a href target=_blank>`, which
  the desk router does not intercept (it only takes `/app` and `/desk` paths).
- The first row is normally `Home` → the module's Workspace, with icon `house`.

## add_to_apps_screen (hooks.py)

```python
add_to_apps_screen = [
	{
		"name": app_name,
		"logo": "/assets/my_app/images/my-app-logo.svg",
		"title": "My App",                         # tile truncates past about 12 characters
		"route": "/desk/my-workshop",
		"has_permission": "my_app.permissions.has_app_permission",
		"sequence_id": 20,
	}
]
app_include_icons = ["/assets/my_app/icons/module-icons.svg"]
```
Optional `"setup_wizard_text"` adds the app to the setup wizard's intro, as ERPNext does.

```python
# permissions.py
def has_app_permission() -> bool:
	if frappe.session.user == "Administrator":
		return True
	if frappe.get_cached_value("User", frappe.session.user, "user_type") != "System User":
		return False
	return bool(frappe.has_permission("Project", "read"))
```

## Desktop Icon (retiring grid, `<app>/desktop_icon/*.json`)

The App parent, which is the grid's equivalent of the tile:
```json
{"doctype": "Desktop Icon", "name": "My App", "label": "My App",
 "app": "my_app", "icon_type": "App", "link_type": "External",
 "link": "/desk/my-workshop",
 "logo_url": "/assets/my_app/images/my-app-logo.svg",
 "hidden": 0, "idx": 20, "roles": [], "standard": 1}
```
A Link child:
```json
{"doctype": "Desktop Icon", "name": "My Workshop", "label": "My Workshop",
 "app": "my_app", "icon_type": "Link", "icon": "wrench",
 "link_type": "Workspace Sidebar", "link_to": "My Workshop",
 "parent_icon": "My App", "hidden": 0, "restrict_removal": 0, "roles": [], "standard": 1}
```
These files are read only by sites whose Desktop Settings still use the icon grid. Frappe will remove
the whole grid in one batch (`frappe/desk/RETIRING.md`), so keep them minimal and correct, and invest nothing more.

## Workspace

There is no new format. Set `"standard": 1` (app-owned: content changes only by import on non-dev
sites, as ERPNext does) and a Lucide `icon`. The Workspace still provides the page body: number cards,
charts and links.
