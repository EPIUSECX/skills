"""Insert rows into a Sidebar in place, through the document, so Frappe exports and validates them.

Typical use: the audit reports workspace shortcuts or cards that "leave this shell" (targets owned by
another app's module). List them in this app's Sidebar so following them stays here.

	bench --site <site> console
	>>> import runpy
	...
	... extend = runpy.run_path("/tmp/extend_sidebar.py")["extend"]
	>>> extend(
	...     "My Workshop",
	...     [("Task", "DocType", "Task")],
	...     section="Shop Floor",
	...     section_icon="factory",
	...     before="Reports",
	... )
	>>> extend(
	...     "Talent Acquisition",
	...     [("Job Offer", "DocType", "Job Offer")],
	...     section="Recruitment",
	...     section_icon="user-search",
	...     after="My Open Actions",
	... )
	>>> extend(
	...     "Employee Lifecycle",
	...     [("Employee Onboarding", "DocType", "Employee Onboarding")],
	...     section="Joining & Development",
	...     first=True,
	... )  # into an existing section
	>>> extend(
	...     "Device Integration",
	...     [("Shift Attendance", "Report", "Shift Attendance", "clock")],
	...     after="Monthly Summary",
	... )  # top-level link (needs an icon)

Rows are (label, link_type, link_to[, icon]). A row whose (link_type, link_to) the sidebar already lists
is skipped. With `section`: an existing section gets the rows as children (at its end, or first with
`first=True`); a new one is created at `after`/`before` (default: the end). Without `section`: the rows
are top-level links. Run refine_sidebars.py with dry_run=True afterwards to confirm icons are unique.
Use `doc.append` then move: inserting a bare child document into `doc.items` is silently not saved.
"""

from __future__ import annotations

import frappe


def _index(doc, label):
	return next(n for n, i in enumerate(doc.items) if i.label == label)


def _section_end(doc, start):
	"""Index just past the children of the section at `start`."""
	n = start + 1
	while n < len(doc.items) and doc.items[n].child:
		n += 1
	return n


def extend(
	sidebar: str,
	rows: list[tuple],
	section: str | None = None,
	section_icon: str | None = None,
	after: str | None = None,
	before: str | None = None,
	first: bool = False,
	dry_run: bool = False,
):
	doc = frappe.get_doc("Sidebar", sidebar)
	listed = {(i.link_type, i.link_to) for i in doc.items if i.link_to}
	todo = [r for r in rows if (r[1], r[2]) not in listed]
	if not todo:
		print("EXTEND", sidebar, "nothing to add")
		return []

	def place(row_dict, pos):
		row = doc.append("items", row_dict)
		doc.items.remove(row)
		doc.items.insert(pos, row)

	def anchor_pos():
		if after:
			return (
				_section_end(doc, _index(doc, after))
				if doc.items[_index(doc, after)].type == "Section Break"
				else _index(doc, after) + 1
			)
		if before:
			return _index(doc, before)
		return len(doc.items)

	if section:
		existing = next(
			(n for n, i in enumerate(doc.items) if i.type == "Section Break" and i.label == section), None
		)
		if existing is None:
			pos = anchor_pos()
			place(
				{
					"type": "Section Break",
					"label": section,
					"icon": section_icon,
					"indent": 1,
					"collapsible": 1,
					"keep_closed": 0,
				},
				pos,
			)
			pos += 1
		else:
			pos = existing + 1 if first else _section_end(doc, existing)
		for label, link_type, link_to, *_ in todo:
			place(
				{"type": "Link", "label": label, "link_type": link_type, "link_to": link_to, "child": 1}, pos
			)
			pos += 1
	else:
		pos = anchor_pos()
		for label, link_type, link_to, *icon in todo:
			if not icon:
				frappe.throw(f"{label}: a top-level row needs an icon")
			place(
				{"type": "Link", "label": label, "link_type": link_type, "link_to": link_to, "icon": icon[0]},
				pos,
			)
			pos += 1

	for n, item in enumerate(doc.items, 1):
		item.idx = n
	added = [r[0] for r in todo]
	if not dry_run:
		doc.save()
		frappe.db.commit()
	print("EXTEND", sidebar, "dry run:" if dry_run else "added:", added)
	return added
