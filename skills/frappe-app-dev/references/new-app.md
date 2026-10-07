# New App Workflow

Follow these steps in order.

## Step 1: Confirm bench root

```bash
ls apps/ sites/ && ls Procfile bench.toml 2>/dev/null
```
If `apps/` and `sites/` exist and one of `Procfile` or `bench.toml` (a Pilot-managed bench) exists, bench is valid. Do not run anything else to verify.

## Step 2: Enable developer mode

```bash
bench set-config -g developer_mode 1
```

## Step 3: Pick or create site

See [site-management.md](./site-management.md) for finding or creating a site. A working site is a prerequisite for the next steps.

## Step 4: Create app

The `bench new-app` command MUST use piped `printf`. No heredoc (`<<EOF`). No `--no-input`. No `--no-git`. No bare `bench new-app <name>` without pipe.

Ask user for: app name, title, description, publisher, email, license.

The prompts are: title, description, publisher, email, license, "Create GitHub Workflow action for unittests" (y/N), and branch name. The empty last line accepts the default branch, which is the frappe app's branch. Email and license are validated. An invalid answer is asked again and shifts every later answer by one line, so use a valid email and a license key such as `mit`.

```bash
printf '<title>\n<description>\n<publisher>\n<email>\n<license>\nN\n\n' | bench new-app <app-name>
```

Example:
```bash
printf 'Expense Tracker\nTrack expenses\nJohn\njohn@example.com\nmit\nN\n\n' | bench new-app expense_tracker
```

## Step 5: Install app on site

```bash
bench --site <site> install-app <app-name>
```

## Step 6: Build features

Write DocTypes, controllers, hooks, permissions, UI directly in the module directory created in step 4.

The app structure after `bench new-app myapp` with the title "My App":
```
apps/myapp/
  pyproject.toml
  myapp/
    my_app/         ← first module: scrub(app title), marked with a .frappe file
      __init__.py
    config/
    public/
    templates/
    www/
    __init__.py
    hooks.py
    modules.txt     ← the list of modules
    patches.txt
```

Load the relevant feature references from the main SKILL.md table as needed.

## Step 7: Migrate and verify

```bash
bench --site <site> migrate
```

**Rules:**
- After migration succeeds, do NOT query the database directly to verify schema changes. The migrate output is the source of truth.

Start bench in background if not already running:
```bash
bench start
```

Get URL:
```bash
bench --site <site> execute frappe.utils.get_url
```
