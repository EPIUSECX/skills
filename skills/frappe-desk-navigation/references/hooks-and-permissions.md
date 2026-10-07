# Hooks and Permissions

## The tile

```python
add_to_apps_screen = [
	{
		"name": app_name,
		"logo": "/assets/<app>/images/<app>-logo.svg",
		"title": "<12 characters or fewer>",  # app_title can be longer
		"route": "/desk/<workspace-slug>",  # /desk, not /app
		"has_permission": "<app>.permissions.has_app_permission",
	}
]
app_include_icons = ["/assets/<app>/icons/module-icons.svg"]
```

- `boot.py` reads only `apps[0]`. The other entries do nothing.
- The tile label is cut at about 93 px, about 12 characters. To measure it, open `/desk` at desktop width and compare `scrollWidth` with `clientWidth` on the label element.
- Use an SVG logo. A raster logo, often not square, blurs and stretches on the tile.

## The permission check

`has_permission` returns a bool. It controls the tile and the whole rail.

```python
def has_app_permission() -> bool:
	if frappe.session.user == "Administrator":
		return True
	if frappe.get_cached_value("User", frappe.session.user, "user_type") != "System User":
		return False
	return frappe.has_permission("<core DocType>", "read")
```

- If the app already has a check for something else, such as a capability for its SPA, keep that check. Add desk read access with `or`. Otherwise a user who works only in the desk loses the rail.
- An app with many product areas often has one `add_to_apps_screen` entry per area. Merge them into one entry. Make its check the union of the area checks. Make each area a Dock row.

## Apps with their own SPA

Some apps have a React or Vue portal, for example at `/portal`, and the tile opens it.

- A route outside `/desk` is valid. The tile is an anchor, so the browser loads the full page.
- But then the tile never leads to the rail. Ask the owner which entry point they want.
- Desk first: route the tile to the main workspace. Add the SPA as a Sidebar URL row with `open_in_new_tab: 1`. Keep `role_home_page` for portal users.
- SPA first: keep the route. Add `"desk_route": "/desk/<workspace>"` to the entry. The Apps screen shows it as a second link under the tile.
- Do not add a `URL` row to the Dock. The desk sends every rail entry through `frappe.set_route`, so `/portal` becomes `/desk/portal`.

## Companion apps

A companion app adds its entries to a host app's rail and has no tile of its own. Set `mount_on: "<host app>"` on the companion's Dock. The mount works only when:

1. the host is installed and ships its own Dock. A host without a Dock ignores the mount, and the companion gets its own tile and rail.
2. the companion's Dock has rows.

Check the result with `frappe.desk.doctype.dock.dock.mounted_apps()`. Also:

- The host's `has_permission` controls the whole rail, companions included. Let it admit companion users too. Check one DocType per companion area, guarded with `frappe.db.exists("DocType", ...)`.
- A companion does not need `add_to_apps_screen`.
- Put companion workspaces in the companion's own modules. A workspace opens in the shell of its module. A workspace filed under another app's module jumps to that app's sidebar. Fix the JSON and any code that sets `workspace.module` during migrate.
