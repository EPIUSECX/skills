#!/usr/bin/env python3
"""Audit a Frappe app against the v16 module-first desk navigation (Apps screen, Dock, Sidebar).

Reads files only: no site, no database, no bench process. Run it with any Python 3.10+:

	python3 audit_desk_navigation.py --bench /path/to/bench --app my_app

Exit code 0 when nothing is FAIL, 1 otherwise. WARN lines are judgement calls, not blockers.
"""

from __future__ import annotations

import argparse
import ast
import json
import re
import sys
from pathlib import Path

ICON_ID = re.compile(r'id="icon-([^"]+)"')
STATUS_ORDER = {"FAIL": 0, "WARN": 1, "OK": 2, "INFO": 3}


def scrub(name: str) -> str:
	return name.strip().lower().replace(" ", "_").replace("-", "_")


def load_hooks(app_pkg: Path) -> dict:
	"""Top-level literal assignments in hooks.py, evaluated safely (no import, no frappe needed)."""
	tree = ast.parse((app_pkg / "hooks.py").read_text())
	names: dict = {}
	for node in tree.body:
		if isinstance(node, ast.Assign) and len(node.targets) == 1 and isinstance(node.targets[0], ast.Name):
			try:
				names[node.targets[0].id] = ast.literal_eval(node.value)
			except ValueError:
				# e.g. "name": app_name -- resolve simple name references against what we have so far
				names[node.targets[0].id] = _eval_with_names(node.value, names)
		elif isinstance(node, ast.ImportFrom) and node.module == "__future__":
			names["__future_import__"] = True
	return names


def _eval_with_names(node, names):
	if isinstance(node, ast.Name):
		return names.get(node.id, f"<{node.id}>")
	if isinstance(node, ast.List):
		return [_eval_with_names(e, names) for e in node.elts]
	if isinstance(node, ast.Dict):
		return {
			_eval_with_names(k, names): _eval_with_names(v, names)
			for k, v in zip(node.keys, node.values, strict=True)
		}
	try:
		return ast.literal_eval(node)
	except ValueError:
		return None


def loaded_sprites(bench: Path) -> list[Path]:
	"""The sprites Desk loads: every app's `app_include_icons`. Not every SVG under public/icons:
	Frappe also ships a full public/icons/lucide.svg that Desk never loads, so an icon found only
	there (`fingerprint`, `book-marked`) renders blank."""
	sprites = []
	for hooks_py in sorted((bench / "apps").glob("*/*/hooks.py")):
		value = load_hooks(hooks_py.parent).get("app_include_icons") or []
		for asset in [value] if isinstance(value, str) else value:
			app, _, rest = str(asset).removeprefix("/assets/").partition("/")
			path = bench / "apps" / app / app / "public" / rest
			if path.exists():
				sprites.append(path)
	return sprites


def icon_names(bench: Path) -> tuple[dict[str, str], set[str]]:
	"""Every icon id the desk can draw, mapped to the sprite set it comes from."""
	found: dict[str, str] = {}
	for sprite in loaded_sprites(bench):
		kind = sprite.parent.name if sprite.name == "icons.svg" else sprite.stem
		for name in ICON_ID.findall(sprite.read_text(errors="ignore")):
			found.setdefault(name, kind)
	legacy = {n for n, k in found.items() if k == "timeless"}
	return found, legacy


ENTITY_KINDS = {"DocType": "doctype", "Report": "report", "Page": "page"}


def index_entities(bench: Path) -> dict[tuple[str, str], str]:
	"""(kind, name) -> module for every DocType, Report and Page on the bench, read from the files."""
	index = {}
	for kind, folder in ENTITY_KINDS.items():
		for path in (bench / "apps").glob(f"*/*/*/{folder}/*/*.json"):
			if path.stem != path.parent.name:
				continue
			try:
				data = json.loads(path.read_text())
			except (OSError, json.JSONDecodeError):
				continue
			if isinstance(data, dict) and data.get("module") and data.get("name"):
				index[(kind, data["name"])] = data["module"]
	return index


def child_tables(bench: Path) -> set[str]:
	"""Names of every child-table DocType (`istable`) on the bench, read from the files."""
	names = set()
	for path in (bench / "apps").glob("*/*/*/doctype/*/*.json"):
		if path.stem != path.parent.name:
			continue
		try:
			data = json.loads(path.read_text())
		except (OSError, json.JSONDecodeError):
			continue
		if isinstance(data, dict) and data.get("istable") and data.get("name"):
			names.add(data["name"])
	return names


def read_json(path: Path):
	try:
		return json.loads(path.read_text())
	except (OSError, json.JSONDecodeError) as e:
		return {"__error__": str(e)}


def audit(bench: Path, app: str) -> list[tuple[str, str, str]]:
	results: list[tuple[str, str, str]] = []

	def add(status, area, message):
		results.append((status, area, message))

	app_root = bench / "apps" / app
	app_pkg = app_root / app
	if not (app_pkg / "hooks.py").exists():
		return [("FAIL", "app", f"{app_pkg}/hooks.py not found")]

	frappe_desk = bench / "apps/frappe/frappe/desk/doctype"
	if not (frappe_desk / "dock").exists() or not (frappe_desk / "sidebar").exists():
		return [
			(
				"INFO",
				"frappe",
				"This Frappe has no Dock/Sidebar doctypes: it predates module-first navigation. "
				"Keep workspace_sidebar/ and desktop_icon/ fixtures; this audit does not apply.",
			)
		]

	icons, legacy_icons = icon_names(bench)
	entity_module = index_entities(bench)
	tables = child_tables(bench)
	hooks = load_hooks(app_pkg)
	modules = [m.strip() for m in (app_pkg / "modules.txt").read_text().splitlines() if m.strip()]

	def check_icon(area, where, name, want_duotone=False):
		if not name:
			return
		if name not in icons:
			add("FAIL", area, f"{where}: icon '{name}' is in no installed sprite")
		elif name in legacy_icons and not want_duotone:
			add("WARN", area, f"{where}: icon '{name}' is a legacy Timeless icon; use the Lucide equivalent")
		if want_duotone and not name.endswith("-duotone"):
			add(
				"WARN",
				area,
				f"{where}: '{name}' is not a -duotone icon; rail and header icons are dual-tone in v16",
			)

	# 1. Apps screen ---------------------------------------------------------------------------
	screen = hooks.get("add_to_apps_screen")
	# A companion app (its Dock has `mount_on`) lives on its host's rail and has no tile of its own.
	peek = app_pkg / "dock" / app / f"{app}.json"
	mount_on = (read_json(peek) or {}).get("mount_on") if peek.exists() else None
	if mount_on:
		host_dock = bench / "apps" / mount_on / mount_on / "dock" / mount_on / f"{mount_on}.json"
		add("INFO", "apps screen", f"companion: mounts on {mount_on}'s rail, so it needs no tile")
		if not host_dock.exists():
			add(
				"FAIL",
				"dock",
				f"mount_on {mount_on}, but the host ships no Dock: the mount is ignored and this app gets "
				"its own rail and tile instead",
			)
		if screen:
			add(
				"WARN", "apps screen", "companion declares add_to_apps_screen: ignored while mounted; drop it"
			)
	elif not screen:
		add("FAIL", "apps screen", "no add_to_apps_screen hook: the app has no tile on /desk")
	else:
		if len(screen) > 1:
			add(
				"FAIL",
				"apps screen",
				f"{len(screen)} add_to_apps_screen entries: the desk builds one tile per app from the FIRST "
				f"entry only ('{screen[0].get('title')}'), and its has_permission gates the whole app and rail. "
				"Collapse to one entry (union permission) and make the other areas Dock entries",
			)
		for entry in screen[:1]:
			title = entry.get("title") or ""
			if len(str(title)) > 12:
				add(
					"WARN",
					"apps screen",
					f"title '{title}' ({len(str(title))} chars) truncates on the tile; keep it ~12",
				)
			logo = entry.get("logo") or ""
			prefix = f"/assets/{app}/"
			if not logo:
				add("FAIL", "apps screen", "add_to_apps_screen has no logo")
			elif logo.startswith(prefix):
				file = app_pkg / "public" / logo[len(prefix) :]
				if not file.exists():
					add("FAIL", "apps screen", f"logo {logo} does not exist at {file}")
				elif file.suffix.lower() == ".svg":
					view_box = re.search(r'viewBox="([\d.\s-]+)"', file.read_text(errors="ignore"))
					dims = view_box.group(1).split() if view_box else []
					if len(dims) != 4 or dims[2] != dims[3]:
						add("WARN", "apps screen", f"logo {logo} has no square viewBox; tiles are square")
					else:
						add("OK", "apps screen", f"tile '{title}' with logo {logo}")
				else:
					# Raster logo: ERPNext, HRMS and Framework all ship SVG, which stays crisp at every
					# tile size and in the sidebar header. A PNG's size sits in its IHDR chunk.
					head = file.read_bytes()[:24]
					size = (
						(int.from_bytes(head[16:20], "big"), int.from_bytes(head[20:24], "big"))
						if head[:8] == b"\x89PNG\r\n\x1a\n"
						else None
					)
					shape = f" ({size[0]}x{size[1]})" if size else ""
					square = "" if not size or size[0] == size[1] else ", and not square"
					add(
						"WARN",
						"apps screen",
						f"logo {logo} is raster{shape}{square}; ship an SVG like ERPNext",
					)
			route = entry.get("route") or ""
			if route and not route.startswith("/desk"):
				add("WARN", "apps screen", f"route '{route}' is not a /desk/... route")
			if not entry.get("has_permission"):
				add("WARN", "apps screen", "no has_permission: every desk user sees the tile")

	# 2. Icon sprite -----------------------------------------------------------------------------
	include_icons = hooks.get("app_include_icons") or []
	if isinstance(include_icons, str):
		include_icons = [include_icons]
	for path in include_icons:
		file = app_pkg / "public" / path.removeprefix(f"/assets/{app}/")
		if not file.exists():
			add("FAIL", "icons", f"app_include_icons entry {path} does not exist")
		else:
			text = file.read_text()
			if "<!--" in text and "--" in text.split("<!--", 1)[1].split("-->", 1)[0]:
				add("FAIL", "icons", f"{path}: '--' inside an XML comment makes the sprite invalid")
			add("OK", "icons", f"{path} registered ({len(ICON_ID.findall(text))} symbols)")

	# 3. Dock ------------------------------------------------------------------------------------
	dock_file = app_pkg / "dock" / app / f"{app}.json"
	dock = read_json(dock_file) if dock_file.exists() else None
	if dock is None:
		add("FAIL", "dock", f"no {dock_file.relative_to(app_root)}: the app has no rail")
	elif "__error__" in dock:
		add("FAIL", "dock", f"{dock_file.name}: {dock['__error__']}")
	else:
		if dock.get("name") != app or dock.get("app") != app or not dock.get("standard"):
			add("FAIL", "dock", "Dock must have name == app == app_name and standard: 1")
		if dock.get("mount_on"):
			add("INFO", "dock", f"companion app mounted on {dock['mount_on']} (kept off the Apps screen)")
		for row in dock.get("items") or []:
			where = f"dock entry '{row.get('title')}'"
			if row.get("link_type") not in ("Sidebar", "Workspace", "URL"):
				add("FAIL", "dock", f"{where}: link_type must be Sidebar, Workspace or URL")
			if row.get("link_type") == "URL":
				add(
					"FAIL",
					"dock",
					f"{where}: URL rail entries open through frappe.set_route on 16.50 ('{row.get('url')}' "
					"becomes /desk/...). Link it from the Sidebar as a URL item with open_in_new_tab",
				)
			if not (row.get("icon") and row.get("title")):
				add("FAIL", "dock", f"{where}: a standard dock row needs both icon and title")
			check_icon("dock", where, row.get("icon"), want_duotone=True)
		add("OK", "dock", f"{len(dock.get('items') or [])} rail entr(y/ies)")

	# 4. Sidebars ------------------------------------------------------------------------------
	sidebar_names = set()
	sidebar_targets: set[tuple] = set()
	for module in modules:
		folder = app_pkg / scrub(module) / "sidebar"
		files = sorted(folder.glob("*/*.json")) if folder.exists() else []
		code_only = hooks.get("code_only_modules") or {}
		if not files and module in code_only:
			heirs = code_only[module] if isinstance(code_only, dict) else []
			add(
				"INFO",
				"sidebar",
				f"module '{module}' is in code_only_modules: no rail entry"
				+ (f"; its entities resolve to {', '.join(heirs)}" if heirs else ""),
			)
		elif not files:
			add(
				"WARN",
				"sidebar",
				f"module '{module}' ships no Sidebar: the desk generates one from its contents; ship "
				"one, or list it in code_only_modules with the modules whose sidebars carry it",
			)
		for file in files:
			sb = read_json(file)
			if "__error__" in sb:
				add("FAIL", "sidebar", f"{file.name}: {sb['__error__']}")
				continue
			sidebar_names.add(sb.get("name"))
			sidebar_targets.update(
				(row.get("link_type"), row.get("link_to"))
				for row in sb.get("items") or []
				if row.get("link_to")
			)
			if file.stem != scrub(sb.get("name") or ""):
				add(
					"FAIL",
					"sidebar",
					f"{file.name}: file name must be scrub(title) '{scrub(sb.get('name') or '')}'",
				)
			if sb.get("module") != module or not sb.get("standard"):
				add("FAIL", "sidebar", f"{file.name}: needs module '{module}' and standard: 1")
			if not sb.get("modified"):
				add(
					"WARN",
					"sidebar",
					f"{file.name}: no 'modified' (raw converter output). Re-save the Sidebar in developer "
					"mode: Frappe writes the canonical export and validates every link",
				)
			check_icon("sidebar", f"{sb.get('name')} header", sb.get("header_icon"), want_duotone=True)
			seen_icons: dict[str, str] = {}
			indented = False
			for row in sb.get("items") or []:
				where = f"{sb.get('name')} / {row.get('label')}"
				check_icon("sidebar", where, row.get("icon"))
				if row.get("link_type") == "DocType" and row.get("link_to") in tables:
					add(
						"FAIL",
						"sidebar",
						f"{where}: '{row.get('link_to')}' is a child table and has no list view; "
						"link its parent DocType instead",
					)
				if row.get("type") == "Section Break" and not row.get("child"):
					indented = bool(row.get("indent"))
				# Desk hides the icons of an indented section's children (ERPNext's style) and draws
				# every other row's icon, or the generic `list` icon for a row without one
				# (frappe/public/js/frappe/ui/sidebar/sidebar_item.js).
				drawn = not (row.get("child") and indented)
				if drawn and row.get("type") in ("Link", "Section Break"):
					icon = row.get("icon")
					if not icon:
						add(
							"WARN",
							"sidebar",
							f"{where}: no icon, so the desk draws the generic list icon on it; give it one, "
							"or set indent on its section to hide the icons of that section's rows",
						)
					elif icon in seen_icons:
						add("WARN", "sidebar", f"{where}: icon '{icon}' already used by '{seen_icons[icon]}'")
					else:
						seen_icons[icon] = row.get("label")
			add("OK", "sidebar", f"{sb.get('name')} ({len(sb.get('items') or [])} items) for module {module}")
	if dock and "__error__" not in dock:
		for row in dock.get("items") or []:
			if row.get("link_type") == "Sidebar" and row.get("link_to") not in sidebar_names | set(modules):
				add(
					"FAIL",
					"dock",
					f"dock entry '{row.get('title')}' points at unknown sidebar '{row.get('link_to')}'",
				)

	# 5. Workspaces ----------------------------------------------------------------------------
	# Code that loads and re-saves Workspaces at install/migrate (e.g. to move them between modules or
	# converge their cards). Marking those standard would make 16.50 refuse the save on customer sites.
	workspace_load = re.compile(r'(get_doc|new_doc)\(\s*"Workspace"')
	runtime_workspace_writers = [
		str(path.relative_to(app_root))
		for path in sorted(app_pkg.rglob("*.py"))
		if "tests" not in path.parts
		and (
			(
				workspace_load.search(text := path.read_text(errors="ignore"))
				and re.search(r"\.(save|insert)\(|_save\(", text)
			)
			# a helper in another app (often the host) that saves the workspace it is handed
			or re.search(r'\bworkspace\s*=\s*"', text)
		)
	]
	for file in sorted(app_pkg.glob("*/workspace/*/*.json")):
		ws = read_json(file)
		if "__error__" in ws:
			continue
		if ws.get("module") and ws["module"] not in modules:
			add(
				"FAIL",
				"workspace",
				f"{ws.get('name')}: module '{ws['module']}' is not one of this app's modules; on 16.50 the "
				"workspace opens in that module's shell (e.g. /desk/hr/...), off this app's rail. Use one of "
				f"{modules} here and in any code that sets workspace.module",
			)
		if not ws.get("standard"):
			if runtime_workspace_writers:
				add(
					"INFO",
					"workspace",
					f"{ws.get('name')}: standard is 0, correctly: this app saves Workspaces in code "
					f"({runtime_workspace_writers[0]}), and 16.50 refuses in-place edits to standard ones",
				)
			else:
				add(
					"WARN",
					"workspace",
					f"{ws.get('name')}: standard is not 1 (ERPNext ships its workspaces standard)",
				)
		check_icon("workspace", f"workspace {ws.get('name')}", ws.get("icon"))

		# A shortcut or card link to ANOTHER app's entity opens in that entity's own shell (User ->
		# Users, Company -> Setup) unless this app's sidebar lists it too.
		targets = [(s.get("type"), s.get("link_to")) for s in ws.get("shortcuts") or []]
		targets += [
			(lk.get("link_type"), lk.get("link_to"))
			for lk in ws.get("links") or []
			if lk.get("type") == "Link"
		]
		leaving = sorted(
			{
				f"{kind} {name}"
				for kind, name in targets
				if kind in ENTITY_KINDS
				and name
				and (kind, name) not in sidebar_targets
				and entity_module.get((kind, name)) not in (None, *modules)
			}
		)
		if leaving:
			add(
				"WARN",
				"workspace",
				f"{ws.get('name')}: {len(leaving)} shortcut/link target(s) owned by other apps are not in this "
				f"app's sidebar, so clicking them leaves this shell: {', '.join(leaving[:6])}"
				f"{' …' if len(leaving) > 6 else ''}",
			)

	# 6. Legacy fixtures -----------------------------------------------------------------------
	# Frappe 16.50 no longer imports these (frappe/model/sync.py). ERPNext still keeps some next to
	# their converted Sidebars, which is harmless; one with no Sidebar is a curated sidebar lost.
	legacy_sidebars = sorted((app_pkg / "workspace_sidebar").glob("*.json"))
	if legacy_sidebars:
		titles = {p.stem: read_json(p).get("title") or read_json(p).get("name") for p in legacy_sidebars}
		unconverted = sorted(t for t in titles.values() if t and t not in sidebar_names)
		converted = len(titles) - len(unconverted)
		if unconverted:
			add(
				"FAIL",
				"legacy",
				f"workspace_sidebar/ is no longer imported and {len(unconverted)} of its sidebars have no "
				f"converted Sidebar ({', '.join(unconverted[:6])}); run `bench --site <site> "
				f"convert-sidebar-fixtures --app {app}`, then delete the folder",
			)
		if converted:
			add(
				"INFO",
				"legacy",
				f"{converted} file(s) in workspace_sidebar/ already have a converted Sidebar; they are "
				"inert and safe to delete",
			)
	icons_dir = app_pkg / "desktop_icon"
	if icons_dir.exists():
		rows = [read_json(p) for p in sorted(icons_dir.glob("*.json"))]
		has_app_icon = any(r.get("icon_type") == "App" for r in rows)
		if not has_app_icon:
			add("WARN", "legacy", "desktop_icon/ has no App-type icon: grid-mode sites show loose link icons")
		for r in rows:
			if r.get("icon_type") == "Link":
				check_icon("legacy", f"desktop icon {r.get('name')}", r.get("icon"))
		add(
			"INFO",
			"legacy",
			"desktop_icon/ only matters on sites whose Desktop Settings still use the icon grid",
		)

	# 7a. Desk JS that REPLACES Frappe's sidebar methods ------------------------------------------
	# One app's monkeypatch runs for every app on the site. one app's sidebar_routing.js replaced
	# set_workspace_sidebar with earlier-v16 logic, so on 16.50 the sidebar switched between apps but the
	# logo and rail stayed one app behind until a refresh. Fine only when it stands down on 16.50.
	override = re.compile(
		r"\b(set_workspace_sidebar|refresh_dock|refresh_header|select_shell|shell_for_route|setup)\s*=\s*function"
		r"|\.prototype\.(set_workspace_sidebar|setup|refresh_dock)\s*="
	)
	for path in sorted(app_pkg.rglob("*.js")):
		if "node_modules" in path.parts or "dist" in path.parts:
			continue
		text = path.read_text(errors="ignore")
		if "sidebar" not in text or not (m := override.search(text)):
			continue
		if "shell_for_route" in text and re.search(
			r'typeof\s+\w+(\.\w+)*\.shell_for_route\s*===\s*"function"', text
		):
			add(
				"INFO",
				"desk js",
				f"{path.relative_to(app_root)} patches the sidebar but stands down on 16.50",
			)
		else:
			add(
				"FAIL",
				"desk js",
				f"{path.relative_to(app_root)} replaces the desk sidebar's {m.group(1) or m.group(2)}() for EVERY "
				"app on the site; on 16.50 the logo/rail lag one app behind. Skip the patch when "
				'typeof frappe.app.sidebar.shell_for_route === "function"',
			)

	# 7. Code and tests still pointing at the old model -------------------------------------------
	stale = {
		"workspace_sidebar/": "references the old sidebar fixture path; if it reads them, point it at <module>/sidebar/<n>/<n>.json",
		"show_sidebar_for_module": "calls a sidebar API removed in 16.50; pages resolve via canonical_shell",
	}
	for path in sorted(app_pkg.rglob("*")):
		if path.suffix not in (".py", ".js") or "node_modules" in path.parts or "dist" in path.parts:
			continue
		text = path.read_text(errors="ignore")
		for needle, why in stale.items():
			if needle in text:
				add("WARN", "stale ref", f"{path.relative_to(app_root)} {why}")

	if hooks.get("__future_import__"):
		add("FAIL", "hooks", "hooks.py imports from __future__: Frappe loads 'annotations' as a hook")

	return sorted(results, key=lambda r: STATUS_ORDER[r[0]])


def main() -> int:
	parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
	parser.add_argument("--bench", required=True, type=Path, help="bench root (holds apps/)")
	parser.add_argument("--app", required=True, help="app name (folder under apps/)")
	args = parser.parse_args()

	results = audit(args.bench.resolve(), args.app)
	for status, area, message in results:
		print(f"{status:<4}  {area:<12} {message}")
	failed = sum(1 for r in results if r[0] == "FAIL")
	print(f"\n{failed} FAIL, {sum(1 for r in results if r[0] == 'WARN')} WARN")
	return 1 if failed else 0


if __name__ == "__main__":
	sys.exit(main())
