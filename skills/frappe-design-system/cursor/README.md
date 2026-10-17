# Use this skill from an application repo

Install from the EPIUSECX skills repo. Do not install `frappe/skills` if you want this copy.

```bash
npx skills add EPIUSECX/skills --skill frappe-design-system
npx skills add EPIUSECX/skills --skill frappe-desk-navigation
```

The skill files land in the agent's skill directory. The checks below stay in this folder; point the hook at the installed path, or vendor `scripts/` next to the app.

## Always-on rule

Copy [frappe-design-system.mdc](frappe-design-system.mdc) to `.cursor/rules/frappe-design-system.mdc` in the app repo. `alwaysApply: true` makes Cursor load it for every turn, including Cloud Agents.

## Stop hook

Copy [hooks.json](hooks.json) to `.cursor/hooks.json`. Adjust the `node` path if the skill is installed outside the repo. The hook runs `check-evidence.mjs`.

Add `.cursor/frappe-design-qa.json` listing the UI sources, the three screenshots, and `verify-report.json`. See [references/visual-verification.md](../references/visual-verification.md). Until that manifest exists, the hook exits 0.

Cloud Agents read `.cursor/rules` and `.cursor/hooks.json` from the repo. A rule that is only in a personal Cursor settings directory is not applied on a cloud run.

## What the hook does not do

It does not open a browser. The agent does that while the task is running, using `scripts/verify-ui.mjs`. The hook only rejects a stop when the evidence is missing or older than the UI.
