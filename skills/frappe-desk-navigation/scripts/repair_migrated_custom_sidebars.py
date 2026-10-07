"""Undo what Frappe's v16 sidebar migration made of this app's old site sidebars.

`frappe.patches.v16_0.convert_custom_sidebars` turns every site-made (non-standard) Workspace Sidebar
into a custom module named after it ("X (Custom)" when module "X" is taken),
moves the matching workspace into that module, blocks it for some users, and saves a *site* Dock
layer for the app with that module appended to the app's rail as it stood at that moment.

On a site that migrated before this app shipped a Dock, that layer holds only the custom entry. A
saved dock layer is the whole rail (`keep_unnamed=False`), so it hides every entry the app ships
and clicking the one left opens the stale copy of an old sidebar.

This app now ships a Sidebar for each of its modules, so those custom copies are redundant. Only
what the migration generated from this app's own sidebars is touched:

- a custom Module Def named "<one of this app's shipped Sidebars> (Custom)" (or "... (Custom) N"),
  with its Sidebar, its Block Module rows, and any workspace moved into it (moved back; the empty
  page Frappe makes for a module added outside a patch, named after it, is deleted);
- the app's site Dock layer, and only when every entry in it points at such a module. A layer
  someone arranged by hand names real entries and is left alone.
"""

from __future__ import annotations

import re

import frappe

APP = "<app>"  # TEMPLATE: copy into <app>/patches/, set this, list it under [post_model_sync]


def execute():
	shipped = {
		row.title: row.module
		for row in frappe.get_all("Sidebar", filters={"app": APP, "standard": 1}, fields=["title", "module"])
	}
	if not shipped:
		return

	generated = {}
	for module in frappe.get_all("Module Def", filters={"custom": 1}, pluck="name"):
		match = re.fullmatch(r"(.+) \(Custom\)(?: \d+)?", module)
		if match and match.group(1) in shipped:
			generated[module] = shipped[match.group(1)]
	if not generated:
		return

	_drop_generated_site_dock(set(generated))

	for module, home in generated.items():
		for workspace in frappe.get_all(
			"Workspace", filters={"module": module}, fields=["name", "standard"]
		):
			# the empty page `Module Def.after_insert` makes for a module added outside a patch
			if workspace.name == module and not workspace.standard:
				frappe.delete_doc("Workspace", workspace.name, force=True, ignore_permissions=True)
				print(f"{APP}: removed '{workspace.name}', the empty page made for that module")
				continue
			frappe.db.set_value("Workspace", workspace.name, "module", home, update_modified=False)
			print(f"{APP}: workspace '{workspace.name}' moved back to '{home}'")
		frappe.db.delete("Block Module", {"module": module})
		for sidebar in frappe.get_all("Sidebar", filters={"module": module, "standard": 0}, pluck="name"):
			frappe.delete_doc("Sidebar", sidebar, force=True, ignore_permissions=True, ignore_on_trash=True)
		frappe.delete_doc("Module Def", module, force=True, ignore_permissions=True, ignore_on_trash=True)
		print(f"{APP}: removed migration copy '{module}' (the app ships '{home}')")

	frappe.clear_cache()


def _drop_generated_site_dock(generated: set[str]) -> None:
	for dock in frappe.get_all("Dock", filters={"app": APP, "standard": 0, "user": ["in", ["", None]]}, pluck="name"):
		targets = {
			row.link_to
			for row in frappe.get_all(
				"Dock Item", filters={"parent": dock, "parenttype": "Dock"}, fields=["link_type", "link_to"]
			)
			if row.link_type == "Sidebar"
		}
		names = set(frappe.get_all("Dock Item", filters={"parent": dock, "parenttype": "Dock"}, pluck="name"))
		# only a layer the migration wrote: every entry a generated module's sidebar, nothing else
		if targets and targets <= generated and len(targets) == len(names):
			frappe.delete_doc("Dock", dock, force=True, ignore_permissions=True)
			print(f"{APP}: removed the site dock layer the sidebar migration saved ({sorted(targets)})")
