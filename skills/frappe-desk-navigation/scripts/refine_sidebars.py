"""Refine an app's Sidebars to the v16 icon conventions, through the Sidebar documents.

Run inside a developer-mode site so Frappe writes each export (and validates every link):

	bench --site <site> console
	>>> import runpy
	>>> refine = runpy.run_path("/tmp/refine_sidebars.py")["refine"]
	>>> refine(
	...     "my_app",
	...     headers={"My Sidebar": "my-app-thing-duotone"},
	...     overrides={("My Sidebar", "Some Row"): "lucide-name"},
	...     dry_run=True,
	... )

(`runpy` rather than `exec`: functions defined by `exec` in the bench console cannot see their own
module globals.)

What it does, per Sidebar of the app:
- maps legacy icon names (Timeless, old Feather) to their Lucide names
- applies `overrides` (sidebar title, row label) -> icon, then `headers` (sidebar title) -> header_icon
- drops icons only from child rows under an indented section (`indent: 1`): Desk hides those
  icons (ERPNext's style). Every other child row draws its own icon, or Desk's generic `list`
  icon when it has none (frappe/public/js/frappe/ui/sidebar/sidebar_item.js), so it keeps one
- refuses to save if any icon is in no installed sprite, a drawn row (top-level row, section
  header, or child of a section that is not indented) has no icon, or two drawn rows of one sidebar
  share an icon. The message says which row, so add an override and rerun.
"""

from __future__ import annotations

import glob
import os
import re

import frappe

# Legacy names seen in real apps, mapped to the Lucide icon that replaced them.
RENAMES = {
	# Timeless (v14/v15 desk set, still loaded but legacy)
	"home": "house",
	"chart": "chart-column",
	"tool": "wrench",
	"projects": "folder-kanban",
	"customer": "user",
	"buying": "shopping-cart",
	"assets": "building",
	"organization": "building-complex",
	"liabilities": "receipt-text",
	"quality": "target",
	"review": "clipboard-check",
	"message": "message-square",
	"message-1": "messages-square",
	"integration": "plug",
	"branch": "git-branch",
	"education": "graduation-cap",
	"folder-normal": "folder",
	"getting-started": "rocket",
	"onboarding": "list-checks",
	"setting": "settings",
	"setting-gear": "settings",
	"grid": "layout-grid",
	"money-coins-1": "banknote",
	"accounting": "calculator",
	"sell": "receipt",
	"hr": "users",
	"support": "headset",
	# Feather / pre-1.0 Lucide names that Lucide renamed (they render blank)
	"alert": "triangle-alert",
	"alert-triangle": "triangle-alert",
	"alert-circle": "circle-alert",
	"check-circle": "circle-check",
	"check-square": "square-check",
	"x-square": "square-x",
	"plus-square": "square-plus",
	"minus-square": "square-minus",
	"x-circle": "circle-x",
	"help-circle": "circle-question-mark",
	"bar-chart": "chart-bar",
	"bar-chart-2": "chart-column",
	"pie-chart": "chart-pie",
	"line-chart": "chart-line",
	"edit": "pencil",
	"edit-2": "pencil",
	"more-horizontal": "ellipsis",
	"more-vertical": "ellipsis-vertical",
	"data": "database",
}


def legacy_icons() -> set[str]:
	"""Timeless names: still drawable, but the v14/v15 set; v16 sidebars use Lucide."""
	path = os.path.join(frappe.get_app_path("frappe"), "public", "icons", "timeless", "icons.svg")
	if not os.path.exists(path):
		return set()
	with open(path, errors="ignore") as f:  # Frappe's own sprite
		timeless = set(re.findall(r'id="icon-([^"]+)"', f.read()))
	lucide_path = os.path.join(frappe.get_app_path("frappe"), "public", "icons", "lucide", "icons.svg")
	with open(lucide_path, errors="ignore") as f:
		lucide = set(re.findall(r'id="icon-([^"]+)"', f.read()))
	return timeless - lucide


def installed_icons() -> set[str]:
	"""Symbols in the sprites Desk actually loads: every app's `app_include_icons`.

	Not every SVG under `public/icons`: Frappe also ships a full `public/icons/lucide.svg` that Desk
	never loads, so an icon found only there (`fingerprint`, `book-marked`) renders blank.
	"""
	names = set()
	for asset in frappe.get_hooks("app_include_icons"):
		app, _, rest = asset.removeprefix("/assets/").partition("/")
		try:
			path = frappe.get_app_path(app, "public", rest)
		except Exception:
			continue
		if os.path.exists(path):
			with open(path, errors="ignore") as f:  # an installed app's own sprite
				names.update(re.findall(r'id="icon-([^"]+)"', f.read()))
	return names


def refine(app: str, headers: dict | None = None, overrides: dict | None = None, dry_run: bool = False):
	headers, overrides = headers or {}, overrides or {}
	icons = installed_icons()
	legacy = legacy_icons()
	problems, report = [], []
	for name in frappe.get_all("Sidebar", {"app": app, "standard": 1}, pluck="name"):
		doc = frappe.get_doc("Sidebar", name)
		changes = []
		if doc.title in headers and doc.header_icon != headers[doc.title]:
			changes.append(("header", doc.header_icon, headers[doc.title]))
			doc.header_icon = headers[doc.title]
		drawn, indented = [], False
		for row in doc.items:
			old = row.icon
			if row.type == "Section Break" and not row.child:
				indented = bool(row.indent)
			if row.child and indented:
				row.icon = None  # Desk does not draw it
			else:
				row.icon = overrides.get((doc.title, row.label)) or RENAMES.get(row.icon, row.icon)
				drawn.append(row)
			if row.icon != old:
				changes.append((row.label, old, row.icon))
		seen = {}
		for row in drawn:
			where = f"{doc.title} / {row.label}"
			if row.type in ("Link", "Section Break") and not row.icon:
				problems.append(f"{where}: no icon")
			elif row.icon and row.icon not in icons:
				problems.append(f"{where}: '{row.icon}' is in no installed sprite")
			elif row.icon in legacy:
				problems.append(
					f"{where}: '{row.icon}' is a legacy Timeless icon; add an override to a Lucide name"
				)
			elif row.icon in seen:
				problems.append(f"{where}: '{row.icon}' already used by '{seen[row.icon]}'")
			elif row.icon:
				seen[row.icon] = row.label
		if doc.header_icon and doc.header_icon not in icons:
			problems.append(f"{doc.title} header: '{doc.header_icon}' is in no installed sprite")
		report.append((doc, changes))
	for doc, changes in report:
		print("SIDEBAR", doc.title, f"{len(changes)} change(s)", changes)
	if problems:
		print("PROBLEMS (nothing saved):", *problems, sep="\n  ")
		return False
	if not dry_run:
		for doc, changes in report:
			if changes:
				doc.save()
		frappe.db.commit()
		print("SAVED", [doc.title for doc, changes in report if changes])
	return True
