# Verify

## Apply

```bash
bench --site <site> migrate
bench --site <site> clear-cache
python3 <skill>/scripts/audit_desk_navigation.py --bench . --app <app>
```

Then load `scripts/check_imported.py` in the bench console and run `check(["<app>"])`. It prints STALE for each fixture that did not reach the database. See [upgrades.md](./upgrades.md) for the reason.

After any install or migrate on a developer-mode site, run `git status` in the app. The app's own hooks can export fixtures again with new timestamps. Revert that noise before you commit.

## Install errors on 16.50

An install that fails leaves the app half installed. It shows in `list-apps`, but its hooks did not finish. Fix the cause, then run `bench --site <site> install-app <app> --force` in dependency order. Known causes:

- `Unknown column 'app'`: 16.50 removed `Workspace.app`. A workspace's app now comes from its module. Guard the write with `frappe.db.has_column("Workspace", "app")`.
- `Could not find Parent Icon: <Other App>`: the code creates Desktop Icons under another app's grid icon. A site on the Apps screen does not import grid icons. Skip the write when the parent Desktop Icon does not exist.
- Reports or charts fail with `Unknown column` on a fresh site: custom fields are made only by a demo or setup step. Create them in `after_install` or `after_migrate`.

## Test on a new site

- Some provisioning tools install every app on the bench on a new site. Install only the apps you need: `bench new-site <site> --install-app erpnext --install-app <app>`.
- A new ERPNext site opens on the setup wizard. To finish it in the console, call `frappe.desk.page.setup_wizard.setup_wizard.setup_complete({...})` with test values. Give `company_name`, `company_abbr`, `currency`, `country`, `timezone`, `fy_start_date`, `fy_end_date`, and `chart_of_accounts: "Standard"`.
- `bench serve` without `--site` serves `default_site` for every host name. A second site on the same port shows the first site. Check `frappe.boot.sitename`. Start a second server on its own port with `--site <new> serve --port 8001`. It has no socket.io, so ignore those console errors.
- Count server errors on each page load. A fresh site often fails where a seeded site does not:
  ```js
  performance.getEntriesByType("resource").filter((r) => r.name.includes("/api/") && r.responseStatus >= 500)
  ```

## Look at it

Open `/desk`. Check the tile. Open the tile and check the rail icons, the sidebar header, and the items. When the browser window is narrow, the desk hides the rail. Check it in the DOM:

```js
[...document.querySelectorAll(".dock-item")].map((e) => [
	e.getAttribute("aria-label"),
	e.querySelector("use")?.getAttribute("href"),
	Math.round(e.querySelector("svg")?.getBoundingClientRect().width || 0), // 0 means the icon is missing
])
```

## Every link must stay in its shell

A route stays in the open sidebar only if that sidebar lists its target. Otherwise the desk opens the target's own shell. A shortcut or card on your workspace that points at another app's DocType sends the user to that app.

- For each target owned by another app's module, add a row to your Sidebar. Use `scripts/extend_sidebar.py`. The audit lists these targets as "leaves this shell".
- Remove rows that point at a child table (`istable`). They have no list view. The audit reports them as FAIL. Old sidebars often list import logs and detail rows.
- Check where each entity opens on a cold load. Inside one app the open sidebar stays, so `shell_for_route` from the current page is not enough:
  ```js
  const cs = frappe.boot.canonical_shell
  ;[cs.DocType["<DocType>"], cs.Page["<page>"], cs.Report["<Report>"]]
  ```
- Cold-load each `/desk/<page>` URL. 16.50 rewrites it to `/desk/<shell>/<page>`.

## Move between apps without a refresh

Desk JS from one app runs for every app. A script that replaces `frappe.app.sidebar.set_workspace_sidebar` shows each new sidebar under the previous app's logo and rail until a refresh. The audit fails such a script unless it stops when `frappe.app.sidebar.shell_for_route` exists. After you go from one tile to another, check:

```js
const sb = frappe.app.sidebar
const logo = document.querySelector(".shell-header img, .header-logo img")?.getAttribute("src")
;[sb.current_module, sb.app_for_sidebar(sb.current_module), frappe.boot.app_data.find((a) => a.app_logo_url === logo)?.app_name]
// the last two must be equal
```

JS listed in `app_include_js` by raw path, not as a `.bundle.js`, has no version query. Browsers keep it for up to 12 hours. Test a fix with `fetch(url, { cache: "reload" })` and a reload.

## Theme

A desk widget, such as a chat panel or a tray, must follow the desk theme, not the operating system.

- Read `data-theme` and `data-theme-mode` on `<html>` one at a time. A branded theme can put its own name in `data-theme`. An `a || b` chain stops at that name.
- If neither is `light` or `dark`, read the computed background color of `<body>`.
- 16.50 does not define `--surface-white`. Use `--surface-base` (`#fff` in light, `#171717` in dark).
- Test with the browser color scheme set to dark and the desk set to light.
