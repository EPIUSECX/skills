# Existing App Workflow

Use this flow when the user wants to extend, modify, or fix an app that already exists.

## Step 1: Find and confirm bench root

The bench root is typically the parent of the workspace directory, or the workspace itself. Look for `apps/`, `sites/`, and `Procfile` (or `bench.toml` on a Pilot-managed bench).

```bash
ls apps/ sites/ && ls Procfile bench.toml 2>/dev/null
```

If the workspace is inside the app (e.g. user opened `apps/myapp/`), go up:
```bash
ls ../../apps/ ../../sites/
```

## Step 2: Locate the app

```bash
ls apps/
```

Find the app directory. Read its module structure:
```bash
ls apps/<app-name>/<app-name>/
```

The app's modules are the lines in `modules.txt`. Not every subdirectory is a module: `public/`, `templates/`, `www/`, `config/` and `patches/` are not. A module folder has a `.frappe` marker file.
```bash
cat apps/<app-name>/<app-name>/modules.txt
ls apps/<app-name>/<app-name>/<module_folder>/
```

Do NOT create a second app. Do NOT run `bench new-app`.

## Step 3: Confirm site and app installation

See [site-management.md](./site-management.md) for finding the right site for this app.

Verify the app is installed:
```bash
bench --site <site> list-apps
```

If not installed:
```bash
bench --site <site> install-app <app-name>
```

## Step 4: Enable developer mode

```bash
bench set-config -g developer_mode 1
```

## Step 5: Build / modify features

Read the app's existing code to understand patterns before making changes. Load only the relevant feature references from the main SKILL.md table.

Key files to read first:
- `apps/<app>/setup.cfg` or `pyproject.toml` — app metadata
- `apps/<app>/<app>/hooks.py` — existing hooks
- `apps/<app>/<app>/<module>/` — existing DocTypes and modules

## Step 6: Migrate and verify

```bash
bench --site <site> migrate
```

Same rules as new app — see [new-app.md](./new-app.md#step-7-migrate-and-verify) for migrate rules.
