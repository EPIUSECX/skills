#!/usr/bin/env python3
"""File-only audit of DocType layout quality. Usage: audit_doctype_layout.py <app_dir> [--strict]

Reads every DocType JSON under <app_dir> and reports what makes a Desk form hard to use:
no tabs on a long form, no section labels, flat form, missing list columns or filters, no
title_field, no search_fields, single-owner fields that should be assignable, report-as-list.
Exit code 1 when any FAIL is printed.
"""
import glob
import json
import sys

OWNER_HINTS = ("assignee", "owner", "assigned_to", "looking_after", "working_on")


def audit(path):
	d = json.load(open(path))
	if d.get("doctype") != "DocType":
		return []
	f = d.get("fields", [])
	out = []
	count = lambda t: sum(1 for x in f if x["fieldtype"] == t)
	visible = [x for x in f if "Break" not in x["fieldtype"] and not x.get("hidden")]
	name = d["name"]
	if d.get("istable"):
		if not any(x.get("in_list_view") for x in f):
			out.append(("FAIL", "child table has no in_list_view columns"))
		return [(lvl, f"{name}: {msg}") for lvl, msg in out]
	if d.get("issingle"):
		return []
	if len(visible) > 25 and not count("Tab Break"):
		out.append(("FAIL", f"{len(visible)} visible fields and no Tab Break"))
	if len(visible) > 8 and not count("Section Break"):
		out.append(("FAIL", "no Section Break: the form is one long column"))
	unlabeled = [x["fieldname"] for x in f if x["fieldtype"] == "Section Break" and not x.get("label")]
	if len(unlabeled) > 1:
		out.append(("WARN", f"{len(unlabeled)} sections without a label: {unlabeled[:3]}"))
	if not 3 <= sum(1 for x in f if x.get("in_list_view")) <= 6:
		out.append(("WARN", "in_list_view should be on 3 to 6 fields"))
	if not any(x.get("in_standard_filter") for x in f):
		out.append(("WARN", "no in_standard_filter field"))
	if not d.get("title_field") and not str(d.get("autoname", "")).startswith("field:"):
		out.append(("WARN", "no title_field: the name is unreadable in lists and links"))
	if not d.get("search_fields"):
		out.append(("WARN", "no search_fields"))
	for x in f:
		if x["fieldtype"] == "Link" and x.get("options") == "User" and any(h in x["fieldname"] for h in OWNER_HINTS):
			out.append(("WARN", f"{x['fieldname']} is a single User link: if several people can work on it, "
			            "use Frappe assignment (_assign) and keep this as the lead, synced by a ToDo hook"))
	if any(x["fieldname"] == "archived" for x in f):
		hidden = next(x for x in f if x["fieldtype"] == "Section Break" and x["fieldname"] == "archive_section") \
			if any(x["fieldname"] == "archive_section" for x in f) else None
		if not hidden or not hidden.get("collapsible"):
			out.append(("WARN", "system/archive fields should sit in a collapsible last section"))
	return [(lvl, f"{name}: {msg}") for lvl, msg in out]


def main():
	if len(sys.argv) < 2:
		sys.exit(__doc__)
	results = []
	for p in sorted(glob.glob(f"{sys.argv[1]}/**/doctype/*/*.json", recursive=True)):
		results += audit(p)
	for lvl, msg in results:
		print(f"{lvl}  {msg}")
	fails = sum(1 for lvl, _ in results if lvl == "FAIL")
	print(f"{fails} FAIL, {len(results) - fails} WARN")
	sys.exit(1 if fails else 0)


main()
