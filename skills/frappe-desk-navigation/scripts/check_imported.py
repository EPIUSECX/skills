"""Report fixture edits that the site never imported (file and database disagree).

Frappe re-imports a fixture on `bench migrate` only when the file's `modified` is newer than the
database row. A hand edit that keeps the old `modified` is silently skipped, on this site and on every
customer site. Run after `bench migrate`:

	bench --site <site> console
	>>> import runpy
	...
	... check = runpy.run_path("/tmp/check_imported.py")["check"]
	>>> check(["my_app", "my_companion"])

Fix each STALE file by bumping its top-level `"modified"` (or by saving the document in developer mode,
which rewrites the file), then migrate and run this again until it prints nothing but DONE.
"""

from __future__ import annotations

import glob
import json

import frappe

# doctype -> (folder under the module, fields compared)
KINDS = {
	"Workspace": ("workspace", ("icon", "standard", "module", "title")),
	"Sidebar": ("sidebar", ("header_icon", "standard", "module", "title")),
}


def check(apps: list[str]) -> list[tuple]:
	stale = []
	for app in apps:
		for doctype, (folder, fields) in KINDS.items():
			for path in sorted(glob.glob(f"{frappe.get_app_path(app)}/*/{folder}/*/*.json")):
				with open(path) as f:  # an installed app's own fixture
					data = json.load(f)
				row = frappe.db.get_value(doctype, data.get("name"), [*fields, "modified"], as_dict=True)
				if not row:
					stale.append((app, doctype, data.get("name"), "not in the database"))
					continue
				diff = {
					k: (data.get(k), row.get(k)) for k in fields if (data.get(k) or 0) != (row.get(k) or 0)
				}
				if diff:
					stale.append(
						(
							app,
							doctype,
							data.get("name"),
							f"file {data.get('modified')} db {row.modified} {diff}",
						)
					)
	for row in stale:
		print("STALE", *row)
	print("DONE", len(stale), "stale")
	return stale
