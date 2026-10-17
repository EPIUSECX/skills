# Frappe design system

A Cursor skill for building Frappe Desk pages and standalone Vue frontends that follow Desk.

The shell covers Frappe Desk **16.50 and later**. It is not locked to 16.50. The bench this skill was measured on runs **v16.52.0**, and that release is the default dock. Espresso tokens and the sidebar match across the range. The dock tile does not: 40px on v16.50 (`data-dock="v16.50"`), 34px on v16.52 (the default). `SKILL.md` tells an agent which one to draw.

## Install

From this repo:

```bash
npx skills add EPIUSECX/skills --skill frappe-design-system
```

The skill name is the `name` field in `SKILL.md`.

## Import into Claude or Codex

`skills/frappe-design-system.zip` (one directory above this folder) is the same skill packaged for upload. The archive’s top level is the `frappe-design-system/` directory, which is the shape Claude.ai expects.

Claude.ai: Settings → Capabilities → Skills → Upload skill, and choose that zip.

Claude Code:

```bash
unzip frappe-design-system.zip -d ~/.claude/skills
```

Codex, for every project on this machine:

```bash
unzip frappe-design-system.zip -d ~/.codex/skills
```

For one repository, unzip into `.agents/skills` instead of `~/.codex/skills`.

## Check the tokens

```bash
node scripts/validate-tokens.mjs
node scripts/check-design-consistency.mjs
node tests/components/tokens.test.mjs
```

`node tests/components/tokens.test.mjs` also runs the report, credential, and evidence tests. Those do not open a browser.

With Chrome and `puppeteer-core`:

```bash
NODE_PATH=/path/to/node_modules node tests/visual/geometry.test.mjs
FRAPPE_USER=... FRAPPE_PASSWORD=... NODE_PATH=/path/to/node_modules node scripts/compare-pages.mjs tests/visual/parity-static.json
FRAPPE_USER=... FRAPPE_PASSWORD=... node scripts/verify-ui.mjs tests/visual/app-routes.example.json
```

`scripts/audit-ui.mjs` and `scripts/verify-ui.mjs` log into a running Desk. Both require `FRAPPE_USER` and `FRAPPE_PASSWORD`. There is no default password. If the browser does not start, `verify-ui.mjs` writes `"visual": false` and exits 2. That is not a pass.

`node scripts/check-evidence.mjs .cursor/frappe-design-qa.json` fails when those screenshots are missing or older than the UI. See `cursor/README.md`.

## Layout

`SKILL.md` is the procedure. `references/` holds the measurements. `tokens/` is the extracted scale. `examples/` are the three shells plus a Desk page and a right panel. `assets/screenshots/` are the Desk captures and the example captures.
