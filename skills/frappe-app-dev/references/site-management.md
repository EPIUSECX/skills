# Site Management

## Finding existing sites

```bash
ls sites/*/site_config.json
```

A site is a directory in `sites/` with a `site_config.json`. Other entries (`assets`, `apps.txt`, `apps.json`, `common_site_config.json`, and so on) are not sites.

## Matching a site to an app

Convention: site name often contains the app name (e.g. `gameplan.localhost` for app `gameplan`).

To confirm which apps are on a site:
```bash
bench --site <site> list-apps
```

If multiple sites exist, check each until you find the one with the target app installed. `bench --site all list-apps` checks all sites in one call, but it stops at the first broken site.

## Creating a new site

First, check if `root_password` is already set in `sites/common_site_config.json`. If not, recommend the user set it once so future site creation doesn't require the password each time:

```bash
bench set-config -g root_password '<pwd>'
```

Then create the site:

```bash
# If root_password is in common_site_config.json:
bench new-site <name>.localhost --admin-password admin

# Otherwise, pass it explicitly:
bench new-site <name>.localhost --db-root-password '<pwd>' --admin-password admin

# Install apps at creation time (repeat the flag per app)
bench new-site <name>.localhost --admin-password admin --install-app <app-name>
```

Without a root password in config or on the command line, `new-site`, `restore` and `drop-site` ask for it interactively, which hangs a non-interactive agent.

Naming convention: `<app-name>.localhost` with hyphens, not underscores (e.g. `expense-tracker.localhost`). Underscores are not valid in host names.

A new site is not reachable on its own host name through `bench start` while `default_site` is set: the dev server serves the default site for every host. See [bench-operations.md](./bench-operations.md).

## Other site commands

See [bench-operations.md](./bench-operations.md). Ask the user before you drop a site.

## Site config

Per-site config lives in `sites/<site>/site_config.json`. Global config in `sites/common_site_config.json`.
