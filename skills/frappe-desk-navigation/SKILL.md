---
name: frappe-desk-navigation
description: >-
  Makes a custom Frappe app look and navigate like ERPNext and Frappe HR on
  Frappe v16.50 and later: the app tile on the Apps screen (/desk), the rail
  (Dock) down the left side, one Sidebar per module, dual-tone rail icons, and
  the app logo. Use it when an app is missing from the Apps screen, has no rail,
  shows a generated sidebar, shows only one "<Area> (Custom)" rail entry after an
  upgrade, opens the wrong sidebar, or still ships workspace_sidebar/ or
  desktop_icon/ fixtures. Covers add_to_apps_screen, Dock, Sidebar,
  convert-sidebar-fixtures, app_include_icons, Lucide icon names, and a
  file-only audit script.
---

# Frappe Desk Navigation (v16.50+)

Frappe v16.50 navigates by module. An app that ships only the old `workspace_sidebar/` and `desktop_icon/` fixtures has no tile on the Apps screen and no rail. The desk also replaces its curated sidebar with a generated one. This skill moves an app to the new model.

The desk still changes between v16 minor releases. Before you edit, confirm the model on the bench (step 1) and compare with the ERPNext checkout on the same bench.

## The model

```
/desk  Apps screen ─── add_to_apps_screen hook (logo, title, route, has_permission)
   │ click a tile
   ▼
/desk/<route>
 ┌────┬──────────────────┬──────────────────────────┐
 │Dock│ Sidebar          │ Workspace page           │
 │rail│ (one per module) │ (cards, charts, links)   │
 └────┴──────────────────┴──────────────────────────┘
 Dock     <app>/dock/<app>/<app>.json             rail icons: *-duotone from an app sprite
 Sidebar  <app>/<module>/sidebar/<n>/<n>.json     item icons: Lucide
 Logo     <app>/public/images/<app>-logo.svg      100x100 SVG

Retiring (read only when Desktop Settings is not "Apps"):
 <app>/desktop_icon/*.json        keep, as one App icon
 <app>/workspace_sidebar/*.json   NOT imported any more: convert, then delete
```

| Surface | Source | Trap |
| --- | --- | --- |
| Apps-screen tile | `add_to_apps_screen` in `hooks.py` | Frappe reads only the first entry. Its `has_permission` also hides the rail. A title over 12 characters is cut off. |
| Rail | `Dock` document, `name == app`, `standard: 1` | No Dock means no rail. Each row needs `icon` and `title`. |
| Rail and header icons | app sprite in `app_include_icons` | The name must end in `-duotone`. |
| Sidebar | `Sidebar` document per module, `standard: 1` | The file name must be `scrub(title)`. Child rows have no icon. |
| Sidebar item icons | Lucide sprite | Old Timeless and Feather names draw nothing or draw the old set. |

## Global rules

- Create Dock and Sidebar records on a site in developer mode. Frappe then writes the JSON files. Do not type them by hand.
- Convert old sidebars with `bench convert-sidebar-fixtures`. Do not type a sidebar again.
- Keep one `add_to_apps_screen` entry per app.
- Never put `--` inside an XML comment in a sprite. It breaks the whole SVG.
- Never add `from __future__ import annotations` to `hooks.py`. Frappe loads `annotations` as a hook.
- Back up the site before you install an app on it only to test this work.
- Run the audit until it reports 0 FAIL.

## Flow

1. Confirm the model. These must exist: `apps/frappe/frappe/desk/doctype/dock`, `apps/frappe/frappe/desk/doctype/sidebar`, and the `bench convert-sidebar-fixtures` command. If they do not exist, stop. The bench is older than v16.50, so keep the old fixtures.
2. Audit the app (no site needed):
   ```bash
   python3 <skill>/scripts/audit_desk_navigation.py --bench <bench> --app <app>
   ```
   Fix each FAIL, then judge each WARN. Run it with `--app erpnext` to see the shipped formats. ERPNext 16.50 is not a clean result: it keeps old `workspace_sidebar/` files, and five of them have no converted Sidebar.
3. Convert the sidebar. Run `bench --site <site> convert-sidebar-fixtures --app <app>`, then delete `workspace_sidebar/`. If the app builds sidebars in code instead, install it and use `scripts/promote_runtime_sidebars.py`. Then refine each Sidebar with `scripts/refine_sidebars.py`. It fixes icon names and saves through the document, so Frappe checks every link.
4. Draw the logo and the sprite. Read [icons.md](./references/icons.md).
5. Set the hooks. Read [hooks-and-permissions.md](./references/hooks-and-permissions.md). It covers the tile, the permission check, apps with their own SPA, and companion apps that add rail entries to a host app.
6. Create the Dock and the Sidebars in developer mode. Read [file-formats.md](./references/file-formats.md).
7. Set each app-owned Workspace to `standard: 1` with a Lucide icon. Keep it at 0 if app code saves the workspace during install or migrate.
8. Migrate and verify. Read [verify.md](./references/verify.md).
9. On an app that already runs on live sites, read [upgrades.md](./references/upgrades.md) before you ship.

## References

| File | Contents |
| --- | --- |
| [file-formats.md](./references/file-formats.md) | JSON for Dock, Sidebar, Desktop Icon, and the hooks block |
| [icons.md](./references/icons.md) | Logo template, duotone sprite template, old icon name to Lucide map |
| [hooks-and-permissions.md](./references/hooks-and-permissions.md) | Tile, permission check, SPA apps, companion apps |
| [verify.md](./references/verify.md) | Install errors on 16.50, test sites, shell checks, theme checks |
| [upgrades.md](./references/upgrades.md) | Fixture import rule, migration leftovers, workarounds to delete |

| Script | Run from | Job |
| --- | --- | --- |
| `audit_desk_navigation.py` | shell | File-only audit. Exit code 1 on FAIL. |
| `refine_sidebars.py` | bench console | Fix icon names, remove child-row icons, check that icons are unique, save |
| `promote_runtime_sidebars.py` | bench console | Turn sidebars built at runtime into shipped Sidebar files |
| `extend_sidebar.py` | bench console | Insert rows or sections into a Sidebar |
| `check_imported.py` | bench console | Print STALE for each fixture file that the database does not match |
| `repair_migrated_custom_sidebars.py` | patch template | Remove the `(Custom)` copies that the v16 migration made |

To use a console script, copy it into the bench host and load it with `runpy.run_path(path)["<function>"]`.
