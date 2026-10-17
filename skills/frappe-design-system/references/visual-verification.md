# Visual verification

A consistency script reads source text. It cannot see a rendered page. Create, Modify, and Audit finish only after the loop in `SKILL.md`: Inspect, Implement, Render, Compare, Correct, Verify.

## What to compare

Match the screen to the nearest native reference, not to an unrelated page.

| You changed | Compare with |
| --- | --- |
| List or report rows | User list. Header 30px, data row 41px, 67px below 576px |
| Number cards and charts | Selling dashboard. Card padding `12px 16px`, radius 12px, value 17px / 600 |
| Dialog | Rename dialog. Width 575px, radius 12px |
| Form sidebar | Item or User form. Panel 277px |
| Dock and sidebar | `references/measured-desk.md` for the app's dock profile |
| A custom board or map | The list chrome around it, plus the card and type rules. The picture inside is the product's |

## Application spec

`scripts/verify-ui.mjs` opens routes you name. It is not limited to the skill examples.

```json
{
  "base": "http://127.0.0.1:8000",
  "login": true,
  "out": "qa/visual",
  "pages": [
    {
      "name": "projects",
      "path": "/desk/my-app/my-project",
      "checks": [
        { "name": "page head", "selector": ".page-head", "expect": { "h": 49 }, "tol": 1 }
      ]
    }
  ]
}
```

Set `FRAPPE_USER` and `FRAPPE_PASSWORD` in the environment. A missing selector is a failed check. The default viewports are 1440×900, 1280×800, and 390×844. The script writes `qa/visual/verify-report.json` and one PNG per page per viewport.

If Chrome does not start, or the password is unset, the report status is `not-run`, `visual` is false, and the process exits 2. Do not treat that as a pass.

`scripts/compare-pages.mjs` still compares a reference URL with a candidate URL. Use it for the skill examples and for any pair of routes. It uses the same credential rule.

## Evidence

After a pass, add `.cursor/frappe-design-qa.json` in the app repo:

```json
{
  "sources": ["desk_ui/src", "myapp/public/css"],
  "shots": [
    "qa/visual/projects-1440x900.png",
    "qa/visual/projects-1280x800.png",
    "qa/visual/projects-390x844.png"
  ],
  "report": "qa/visual/verify-report.json"
}
```

`node scripts/check-evidence.mjs .cursor/frappe-design-qa.json` fails when a shot or the report is missing, older than the sources, not a pass, or missing one of the three viewports. With no manifest, the command exits 0 so a repo that has not opted in is left alone.
