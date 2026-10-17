# Frappe Skills

A collection of agent skills for building [Frappe Framework](https://frappeframework.com/) applications, plus general skills for code style, code review, writing, and UI design.

## Skills

| Skill | What it covers |
| ----- | -------------- |
| `frappe-app-dev` | Full-stack Frappe: DocTypes and their design (naming, layout, list view, permissions), controllers, APIs, database/ORM, hooks, permissions, jobs, realtime, caching, testing, app setup, frontend (Desk/Vue/portal), and the bench CLI + site management |
| `frappe-desk-navigation` | Frappe v16.50 desk navigation for custom apps: Apps-screen tile, rail (Dock), module Sidebars, duotone icons, and logo. Includes an audit script, sidebar tools, and a repair patch for sites that the v16 migration left with one `(Custom)` rail entry |
| `frappe-design-system` | Visual and behavioural parity with Frappe Desk. Required for new and existing Desk pages, Workspaces, Vue and Frappe UI, CSS, navigation chrome, and responsive layout. Espresso tokens, the v16.50 dock (40px tiles) and the v16.52 dock (34px tiles), measurement scripts, and a render-and-compare loop. A static CSS check is not verification. `skills/frappe-design-system.zip` is the same folder packaged for Claude and Codex |
| `frappe-code-review` | Review checklist for Frappe applications: correctness, security, performance, concurrency, readability, API design, and testing |
| `code-style` | General code style rules |
| `technical-writing` | Write documentation, READMEs, commits, pull requests, and release notes in Simplified Technical English |
| `ui-design` | General UI/UX design principles |
| `draft-security-advisory` | Write a publication-ready GitHub Security Advisory (GHSA) from a vulnerability report — Summary, Details, Proof of concept, and Impact fields, CVSS, CWE, versions, credits. User-invoked only: run `/draft-security-advisory` |
| `deep-app-audit` | Multi-agent audit of a Frappe app for security, correctness, and customization defects. Every candidate is verified, and the result is one report. A script runs the tasks with any agent CLI. User-invoked only: run `/deep-app-audit <app path>` |
| `ship-it` | Take finished work to a merge-ready PR: confirm the intent, review with fresh subagents, test the change live, fix docs and lint, open the PR with evidence, and watch CI and review bots. User-invoked only: run `/ship-it` |

## Install

Install all skills from this repo:

```bash
npx skills add EPIUSECX/skills
```

Install a single skill:

```bash
npx skills add EPIUSECX/skills --skill frappe-design-system
```

Install several at once:

```bash
npx skills add EPIUSECX/skills \
  --skill frappe-app-dev --skill frappe-design-system --skill frappe-desk-navigation
```

`frappe/skills` is the upstream Frappe collection. This repository is `EPIUSECX/skills`. Install from here when you want the design-system visual checks and the other skills in this tree.

Skills are matched by the `name` field in each `SKILL.md` frontmatter, and live under `skills/<name>/`.

## Usage

Most skills activate automatically when you ask your agent about a matching task. Examples: create a DocType, build a Vue SPA, or run `bench migrate` (`frappe-app-dev`), review a diff (`frappe-code-review`), write a commit message (`technical-writing`), or change a Desk page, a stylesheet, or a Vue screen (`frappe-design-system`).

For a Frappe screen, also copy `skills/frappe-design-system/cursor/` into the app repo. The rule is always applied. The stop hook rejects a finish when `.cursor/frappe-design-qa.json` lists screenshots that are missing or older than the UI. See `skills/frappe-design-system/cursor/README.md`.

Some skills only run when you call them. Run `/draft-security-advisory`, `/deep-app-audit`, or `/ship-it` to start them.
