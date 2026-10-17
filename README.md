# Frappe Skills

A collection of agent skills for building [Frappe Framework](https://frappeframework.com/) applications, plus general skills for code style, code review, writing, and UI design.

## Skills

| Skill | What it covers |
| ----- | -------------- |
| `frappe-app-dev` | Full-stack Frappe: DocTypes and their design (naming, layout, list view, permissions), controllers, APIs, database/ORM, hooks, permissions, jobs, realtime, caching, testing, app setup, frontend (Desk/Vue/portal), and the bench CLI + site management |
| `frappe-desk-navigation` | Frappe v16.50 desk navigation for custom apps: Apps-screen tile, rail (Dock), module Sidebars, duotone icons, and logo. Includes an audit script, sidebar tools, and a repair patch for sites that the v16 migration left with one `(Custom)` rail entry |
| `frappe-design-system` | Visual and behavioural parity with Frappe Desk: Espresso tokens, shell geometry, Frappe UI settings, dashboards, and right-hand panels. Records the v16.50 dock (40px tiles) against the v16.52 dock (34px tiles). Includes measurement scripts and reference pages. `skills/frappe-design-system.zip` is the same folder packaged for Claude and Codex |
| `frappe-code-review` | Review checklist for Frappe applications: correctness, security, performance, concurrency, readability, API design, and testing |
| `code-style` | General code style rules |
| `technical-writing` | Write documentation, READMEs, commits, pull requests, and release notes in Simplified Technical English |
| `ui-design` | General UI/UX design principles |
| `draft-security-advisory` | Write a publication-ready GitHub Security Advisory (GHSA) from a vulnerability report — Summary, Details, Proof of concept, and Impact fields, CVSS, CWE, versions, credits. User-invoked only: run `/draft-security-advisory` |
| `deep-app-audit` | Multi-agent audit of a Frappe app for security, correctness, and customization defects. Every candidate is verified, and the result is one report. A script runs the tasks with any agent CLI. User-invoked only: run `/deep-app-audit <app path>` |
| `ship-it` | Take finished work to a merge-ready PR: confirm the intent, review with fresh subagents, test the change live, fix docs and lint, open the PR with evidence, and watch CI and review bots. User-invoked only: run `/ship-it` |

## Install

Install all skills from the repo:

```bash
npx skills add frappe/skills
```

Install a single skill:

```bash
npx skills add frappe/skills --skill frappe-app-dev
```

Install several at once:

```bash
npx skills add frappe/skills \
  --skill frappe-app-dev --skill code-style --skill ui-design
```

Skills are matched by the `name` field in each `SKILL.md` frontmatter, and live under `skills/<name>/`.

## Usage

Most skills activate automatically when you ask your agent about a matching task. Examples: create a DocType, build a Vue SPA, or run `bench migrate` (`frappe-app-dev`), review a diff (`frappe-code-review`), write a commit message (`technical-writing`), or lay out a page (`ui-design`).

Some skills only run when you call them. Run `/draft-security-advisory`, `/deep-app-audit`, or `/ship-it` to start them.
