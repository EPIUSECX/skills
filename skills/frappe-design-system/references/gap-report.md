# Validation and gaps

## Verified

- Bench versions and commits in environment.md.
- v16.50.0 dock file fetched from GitHub and diffed against v16.52.0. Only `dock.scss` differed in the set that was compared.
- Espresso CSS custom properties extracted to `tokens/tokens.json` (light, first declaration).
- Chrome measurements at 1440×900 for the Apps screen, the User list, and the User form. Screenshots are in `assets/screenshots/`.
- Apps screen also captured at 1280×800, 1920×1080, and 390×844.
- Frappe UI 1.0.0 Sidebar defaults read from `Sidebar.vue`.
- CRM dashboard grid and side-panel field columns read from GitHub `develop` at `47bb9417bd74`.
- ESS and Cargo dock CSS read in the working trees.
- Examples measured by `tests/visual/geometry.test.mjs`.

## Mapped without a custom rebuild

Button, badge, sidebar, dialog, toast, tabs, form controls, list rows: Frappe UI or Desk already provides them. The examples style the shell and the page body only.

## Still custom

- Metric card (no Frappe UI equivalent with the number-card padding)
- The standalone dock, because Frappe UI's rail is not the Desk dock
- CRM field rows inside a 277px column, when you are not inside CRM

## Unresolved

- List and form were not measured at 1280, 1920, or 390. Only the Apps screen was.
- `.list-row` measured 41px while the token is 30px. The difference was not traced node by node.
- Search: Ctrl+K during capture did not open a dialog (`search-1440x900.png` is still the list). Awesome-bar geometry is unverified.
- A modal was not opened. Shadow and width are source-defined only (`--modal-shadow: var(--shadow-md)`).
- Dark theme tokens were not measured. They are in `colors.css` and `effects.css` under `[data-theme="dark"]` and are not copied into `variables.css`.
- CRM was not running. Its grid numbers are from source, not from a screenshot.
- ERPNext workspace card padding was not measured on a populated workspace. The capture click landed back on the desktop.
- InterVariable is loaded by Desk. The examples fall through the font stack if the variable font is not installed. Geometry tests do not depend on the font.

## Maintaining this skill

When Frappe bumps a minor version, diff `dock.scss`, `sidebar.scss`, `side_panel.scss`, and `css/espresso/*.css` against the commits in environment.md. If only the dock changes, update navigation.md and the dock profiles in `variables.css`. Do not regenerate the palette by hand. Re-run `scripts/validate-tokens.mjs` against a checkout of that version.
