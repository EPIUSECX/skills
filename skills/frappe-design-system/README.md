# Frappe design system

A Cursor skill for building Frappe Desk pages and standalone Vue frontends that follow Desk.

The design target is Frappe **v16.50.0**. The bench this skill was measured on runs **v16.52.0**. The Espresso tokens and the sidebar match. The dock tile does not: 40px on v16.50, 34px on v16.52. `SKILL.md` tells an agent which one to draw.

## Install

From this repo:

```bash
npx skills add EPIUSECX/skills --skill frappe-design-system
```

The skill name is the `name` field in `SKILL.md`.

## Check the tokens

```bash
node scripts/validate-tokens.mjs
node scripts/check-design-consistency.mjs
node tests/components/tokens.test.mjs
```

With Chrome and `puppeteer-core`:

```bash
NODE_PATH=/path/to/node_modules node tests/visual/geometry.test.mjs
NODE_PATH=/path/to/node_modules node scripts/compare-pages.mjs tests/visual/parity-static.json
```

`scripts/audit-ui.mjs` logs into a running Desk and rewrites `references/visual-audit/`. It needs `FRAPPE_USER` and `FRAPPE_PASSWORD` when the site password is not the local default.

## Layout

`SKILL.md` is the procedure. `references/` holds the measurements. `tokens/` is the extracted scale. `examples/` are the three shells plus a Desk page and a right panel. `assets/screenshots/` are the Desk captures and the example captures.
