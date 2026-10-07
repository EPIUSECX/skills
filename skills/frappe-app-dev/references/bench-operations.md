# Bench CLI Reference

## App & site lifecycle

```bash
# New app (MUST pipe input — no heredoc, no --no-input)
# Prompts: title, description, publisher, email, license, GitHub workflow (y/N), branch name.
# The empty last line accepts the default branch (the frappe app's branch).
printf '<title>\n<desc>\n<publisher>\n<email>\n<license>\nN\n\n' | bench new-app <app-name>

# New site (set root_password in common_site_config first: bench set-config -g root_password '<pwd>')
bench new-site <name>.localhost --admin-password admin

# Install/uninstall app (uninstall asks for confirmation unless --yes; it takes a backup unless --no-backup)
bench --site <site> install-app <app-name>
bench --site <site> uninstall-app <app-name> --yes

# List apps on site
bench --site <site> list-apps

# Migrate (apply schema + data changes)
bench --site <site> migrate

# Set default site
bench use <site>
```

Site resolution: `--site`, then the `FRAPPE_SITE` environment variable, then `default_site` in `common_site_config.json`. `currentsite.txt` is no longer read. A site-scoped command run without `--site` acts on the default site.

`bench start` runs `frappe serve` without `--site`, so with `default_site` set it serves that site for every host name. To open a second site, use the default site's host, unset `default_site`, or start another server with `bench --site <other> serve --port 8001`.

Migrate order: `before_migrate` hooks → `[pre_model_sync]` patches → sync of module JSON (DocTypes, Workspaces, Reports, Sidebars, Docks, ...) → `[post_model_sync]` patches → scheduled jobs, fixtures, dashboards, customizations → orphan cleanup → `after_migrate` hooks.

A module JSON file other than a DocType is imported only if its `modified` is newer than the database row. A DocType compares a hash instead. Change `modified` (or save the record in developer mode) when you edit such a file by hand, or no existing site gets the change. Fixtures listed in `hooks.fixtures` are the opposite: they are imported with `force=True` on every migrate.

## Development

```bash
# Start dev server (run in BACKGROUND)
bench start

# Developer mode
bench set-config -g developer_mode 1

# Python console with site context
bench --site <site> console

# Execute a Python expression
bench --site <site> execute frappe.utils.get_url

# Execute with args and kwargs (each is a Python literal; the call is committed)
bench --site <site> execute path.to.function --args "['a', 'b']" --kwargs "{'key': 'value'}"

# Run tests
bench --site <site> run-tests --app <app-name>
bench --site <site> run-tests --doctype "DocType Name"

# Build frontend assets
bench build --app <app-name>

# Watch mode for frontend
bench watch
```

## Site maintenance

```bash
# Backup (database only unless --with-files)
bench --site <site> backup --with-files

# Restore (files only with --with-public-files / --with-private-files; an encrypted backup
# from another site needs --encryption-key)
bench --site <site> restore <sql.gz> --with-public-files <tar> --with-private-files <tar>

# Clear cache
bench --site <site> clear-cache
bench --site <site> clear-website-cache

# Set site config
bench --site <site> set-config <key> <value>

# Global config
bench set-config -g <key> <value>

# MariaDB console (debugging only)
bench --site <site> mariadb

# Drop site (DESTRUCTIVE)
bench drop-site <site> --db-root-password '<pwd>'
```

## Fixtures

```bash
# Export fixtures defined in hooks.py
bench --site <site> export-fixtures --app <app-name>
```
