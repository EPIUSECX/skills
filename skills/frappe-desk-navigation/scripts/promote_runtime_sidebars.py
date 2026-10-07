"""Promote runtime-built `Workspace Sidebar` records into shipped, per-module `Sidebar` exports.

For apps that never shipped `workspace_sidebar/*.json` but BUILD their sidebars in code at install or
migrate time (`frappe.new_doc("Workspace Sidebar")` in an `after_migrate` hook). `bench
convert-sidebar-fixtures` reads files, so it finds nothing to convert, and on Frappe 16.50 those database
records are inert: every module falls back to a generated sidebar. This does what the converter
does, using Frappe's own `build_sidebar` / `options_as_filters` / `write_export`, but it sources the
rows from the database.

Run inside a developer-mode site, AFTER the app's own install hook has built its records:

	bench --site <site> console
	>>> import runpy
	>>> promote = runpy.run_path("/tmp/promote_runtime_sidebars.py")["promote"]
	>>> promote({"Overview": "My App Core", "Tax": "My App Tax"}, dry_run=True)

The mapping is {Workspace Sidebar name: target Module Def}. The module decides which app folder the export
lands in, so map a sidebar to the module of the app that should ship it, even if the runtime record
says another app. Then `bench migrate`, and refine with refine_sidebars.py (it re-saves, which validates
links and stamps `modified`). An existing export is never overwritten.
"""

from __future__ import annotations

import os

import frappe
from frappe.desk.doctype.sidebar.convert_fixtures import export_path, write_export
from frappe.desk.doctype.sidebar.sidebar import build_sidebar, options_as_filters

ITEM_FIELDS = (
	"type",
	"label",
	"link_type",
	"link_to",
	"url",
	"icon",
	"child",
	"indent",
	"collapsible",
	"keep_closed",
	"show_arrow",
	"route_options",
	"navigate_to_tab",
	"open_in_new_tab",
	"filters",
)


def promote(mapping: dict[str, str], dry_run: bool = False) -> list[tuple]:
	results = []
	for name, module in mapping.items():
		if not frappe.db.exists("Workspace Sidebar", name):
			results.append((name, module, "no runtime record"))
			continue
		if not frappe.db.exists("Module Def", module):
			results.append((name, module, "no such module"))
			continue
		record = frappe.get_doc("Workspace Sidebar", name)
		rows = []
		for item in record.items:
			row = frappe._dict({f: item.get(f) for f in ITEM_FIELDS if item.meta.has_field(f) or f in item})
			options_as_filters(row)
			rows.append(row)
		source = frappe._dict(
			name=name,
			title=record.title or name,
			icon=record.header_icon,
			module=module,
			rows=rows,
			sequence_id=0,
			creation=str(record.creation),
			path=f"Workspace Sidebar/{name}",
		)
		plan = build_sidebar(module, [source])
		path = export_path(module, plan["title"])
		if os.path.exists(path):
			results.append((name, module, f"already exported: {path}"))
			continue
		app = frappe.db.get_value("Module Def", module, "app_name")
		if not dry_run:
			write_export(path, module, plan, app)
		results.append(
			(
				name,
				module,
				f"{'would write' if dry_run else 'wrote'} {app}: {path} ({len(plan['items'])} items)",
			)
		)
	for row in results:
		print("PROMOTE", *row)
	return results
