# Interactions

Source-defined durations. Do not add a 400ms fade to a hover.

| Motion | Duration | Easing | Source |
| --- | --- | --- | --- |
| Button color | 120ms | (CSS default) | `button.css` |
| Sidebar width | 0.3s | ease-in-out | `sidebar.scss` |
| Sidebar content | 0.25s / 0.2s | `cubic-bezier(0.4, 0, 0.2, 1)` / ease | `sidebar.scss` |
| Dock slide | 0.28s | `cubic-bezier(0.4, 0, 0.2, 1)` | `dock.scss` |
| Dock and sidebar together | 0.5s | `cubic-bezier(0.65, 0, 0.35, 1)` | `--dock-sidebar-ease` in `dock.scss` |
| Tile hover | 0.15s | ease | `dock.scss` |
| Side panel | 200ms | ease | `side_panel.scss` (`right`, not transform) |
| ESS dashboard enter | 300ms | `cubic-bezier(0.2, 0.8, 0.2, 1)` | ESS `style.css`. App-specific. Do not copy onto Desk |

## Hover

Pointer devices only. The button CSS wraps hover in `@media (hover: hover)` so a tapped phone does not stick. Follow that.

Sidebar row hover is `--surface-gray-2` and radius 8px. Dock tile hover depends on the version (navigation.md).

## Focus

`:focus-visible` uses the Espresso ring. Do not style `:focus` with `outline: none` unless you replace it with `--focus-outline-default`.

## Menus

An open menu sets `aria-expanded="true"` on the trigger. The trigger keeps the active background. Dismiss on Escape and on a click outside.

## Tables

Clicking a row opens the record or fills the side panel. It does not navigate and open a dialog. Sort toggles on the column header. Filter count, when shown, is a badge on the filter button.

## Scroll

The page column scrolls. The sidebar and the dock do not scroll the page with them. The dock item list scrolls inside the tray (`overflow-y: auto`, scrollbar hidden). The side panel scrolls its own body.

## Reduced motion

ESS and Cargo pause icon motion under `prefers-reduced-motion: reduce`. Do the same for any animation you add. Desk's width transitions can stay. They are short and they communicate state.
