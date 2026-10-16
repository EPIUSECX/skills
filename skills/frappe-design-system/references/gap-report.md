# Validation and gaps

Updated after the second measurement pass on the same bench (Frappe v16.52.0, `4515014`).

## Closed in this pass

| Earlier gap | What closed it |
| --- | --- |
| List and form only at 1440 | `list-1280x800`, `list-1920x1080`, `list-390x844`, and the matching `form-*` JSON files. Shell stays 57 + 224 + 49. At 390 the dock is out of layout, the sidebar drawer is 224px at x=0, and the form sidebar sits at x=−305 |
| Data row 41px vs token 30px | Traced. `--list-row-height` is the header. The data row is 40px of padding and line-height plus a 1px border. `list-row-trace.json` |
| Search | `frappe.app.awesome_bar.open()` opened a 575px dialog. Input 28px. Footer 40px. `search.json`, `assets/screenshots/search-1440x900.png` |
| Modal | A Rename `frappe.ui.Dialog` measured 575×221, content radius 12px, shadow `0 5px 10px rgba(0,0,0,0.1)`. `modal.json` |
| Dark theme | `data-theme="dark"` on Desk and on the static example. Page, sidebar, dock, list, subject, primary button, and badge colours matched (`parity-static.json`, page `detail-view-dark`). Dark `--surface-sidebar` is transparent; the painted surface is `--surface-gray-1` |
| Workspace | Accounting workspace onboarding widget: padding `16px 12px`, radius 12px. `workspace.json` |
| Font in examples | `assets/fonts/InterVariable.woff2` (SIL OFL, same file Frappe ships) is loaded from `tokens/variables.css` |
| Form chrome from the Item screenshot | `examples/record-form/index.html`: 42px tabs, two-column fields, 80px letter tile, 277px panel |

## Still custom, on purpose

- `assets/templates/shell.css` recreates the shell for a page that is not inside Desk. Inside Desk, do not load it. Use `examples/desk-page/page.js`.
- The record form and the detail list use demo data. Column sets are not the User list's columns.

## Still open

- Frappe CRM is not installed on this bench. The 20×42 grid and the 35/65 side panel stay source-defined from CRM `develop` `47bb9417bd74`.
- The supported range is Desk 16.50 and later. v16.52 is the default profile and was compared live. v16.50 was not booted. Its dock comes from `dock.scss` at `f20f92d` and from `data-dock="v16.50"` on the examples.
- The User form had no image, so the 80px letter tile is from `form_sidebar.scss` and the example, not from a record that shows a photo.
- At 390 the open drawer matches the 224px sidebar box. The pixel diff stays high because the example's link list is shorter than Desk's and Desk's mobile sidebar shows a search field plus the user card.
- List and form at 1280 and 1920 were not given a second visual pass beyond the earlier box measurements.

## Maintaining this skill

When Frappe bumps a minor version, diff `dock.scss`, `sidebar.scss`, `side_panel.scss`, `list.scss`, `form.scss`, and `css/espresso/*.css` against the commits in environment.md. Re-run `scripts/compare-pages.mjs` and `tests/visual/geometry.test.mjs`.
