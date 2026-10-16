# Validation and gaps

Updated after the second measurement pass on the same bench (Frappe v16.52.0, `4515014`).

## Closed in this pass

| Earlier gap | What closed it |
| --- | --- |
| List and form only at 1440 | `list-1280x800`, `list-1920x1080`, `list-390x844`, and the matching `form-*` JSON files. Shell stays 57 + 224 + 49. At 390 the dock is out of layout, the sidebar drawer is 224px at x=0, and the form sidebar sits at x=−305 |
| Data row 41px vs token 30px | Traced. `--list-row-height` is the header. The data row is 40px of padding and line-height plus a 1px border. `list-row-trace.json` |
| Search | `frappe.app.awesome_bar.open()` opened a 575px dialog. Input 28px. Footer 40px. `search.json`, `assets/screenshots/search-1440x900.png` |
| Modal | A Rename `frappe.ui.Dialog` measured 575×221, content radius 12px, shadow `0 5px 10px rgba(0,0,0,0.1)`. `modal.json` |
| Dark theme | `data-theme="dark"` computed the tokens in `dark.json`. Page surface painted `#171717`. Sidebar used-value did not follow in the same call |
| Workspace | Accounting workspace onboarding widget: padding `16px 12px`, radius 12px. `workspace.json` |
| Font in examples | `assets/fonts/InterVariable.woff2` (SIL OFL, same file Frappe ships) is loaded from `tokens/variables.css` |
| Form chrome from the Item screenshot | `examples/record-form/index.html`: 42px tabs, two-column fields, 80px letter tile, 277px panel |

## Still custom

- Metric card
- The standalone dock
- The record-form page, which recreates Desk form chrome for a standalone shell. Inside Desk, use the native form

## Still open

- Frappe CRM is not installed on this bench. Installing it would add an app and a site migration. Grid and side-panel numbers stay source-defined from `develop` `47bb9417bd74`.
- The dark sidebar's painted background did not match `--desk-sidebar-bg` (`#1f1f1f`) in the attribute-only toggle. The page surface did.
- The User form had no image, so the 80px letter tile was measured from `form_sidebar.scss` (`.standard-image` is 80px, 40px type, radius `--radius-lg`) and checked on the example, not on a record that shows the tile.
- List and form at 1280 and 1920 were not given a second visual pass beyond the box measurements. The 390 screenshots show the drawer open over the page.

## Maintaining this skill

When Frappe bumps a minor version, diff `dock.scss`, `sidebar.scss`, `side_panel.scss`, `list.scss`, `form.scss`, and `css/espresso/*.css` against the commits in environment.md. Re-run `scripts/audit-ui.mjs` and `tests/visual/geometry.test.mjs`.
