# Measured Desk

Numbers an agent should copy. The supported range is Frappe Desk 16.50 and later, not 16.50 alone. Shared chrome below was computed on the v16.52.0 bench (`4515014`, site on port 8000) at 1440×900, and the same values are in the v16.50.0 tag (`f20f92d`) except the dock. The default dock profile is v16.52, because that is the latest release measured here. `data-dock="v16.50"` selects the older profile. That older profile was checked in `dock.scss` and by switching an example; a v16.50 site was not booted.

`tests/visual/parity-static.json`, `parity-users.json`, and `parity-mobile.json` are the checks. A pair listed there passed on the last run of this audit.

## Shell

| Piece | Value |
| --- | --- |
| Pinned dock | 57px wide, full height, background `--desk-sidebar-bg` |
| Sidebar | x after the dock, 224px, background `#f8f8f8` (`--surface-sidebar`) in light. In dark, `--surface-sidebar` is transparent and the painted sidebar is `--surface-gray-1` (`#1f1f1f`) |
| Sidebar header | 40px row, padding `0 15px 0 12px`, title 14px / 500 / `--ink-gray-8`, chevron 16px `--ink-gray-7` |
| Sidebar rows | 28px, 2px gap, label 13px / 420 / `--ink-gray-6` at 0.02em. Icon 16px, stroke 1.5. An 18px gap separates the utility group from the module group |
| Active row | `--surface-elevation-3`, `--shadow-sm`, radius 8px |
| Hover row | `--surface-gray-2` |
| Page head | border box 49px (token 48px + 1px border), padding `0 15px` |
| Breadcrumb | 16px / 500, line-height 24px, padding `4px 2px`. Parent `--ink-gray-5`, current `--ink-gray-9` |

## Dock profiles

v16.50 source (`dock.scss` at `f20f92d`): tile 40px, gap 6px, base padding 8px, pinned `padding-top: 4px` so the used padding is `4px 8px 8px`, radius 12px. Idle ink `--ink-gray-7`. The hover rule is ink only ("a step in ink and no fill"). Active fill `rgba(0,0,0,0.12)`. `--dock-tile-hover` (`rgba(0,0,0,0.07)` light, `rgba(255,255,255,0.14)` dark) paints the user-menu button, not the tile. Glyphs: Lucide at `--icon-md` (20px), duotone at `--icon-lg` (24px). There is no `.icon-rail` at this tag.

v16.52, measured: padding `8px 11px 12px`, tile 34px, radius 8px, gap 4px, idle ink `--ink-gray-5`, hover fill `--surface-gray-2` with ink `--ink-gray-7`, active `--surface-elevation-3` plus `--shadow-sm`. Glyph `.icon-rail` is 22px.

The mark is not a tile. `.dock-logo` is a 49px band (`--page-head-height` plus the 1px rule), `margin-top: -8px` so it sits on the window edge, and `border-bottom: 1px solid var(--outline-gray-1)`. The 32×32 logo is centered in that band (y=8). `.dock-items` then uses `margin-top: -4px` (cancels the tray gap) and `padding-top: 12px`, so the first tile is at y=61. On a pinned dock the scroller is `width: calc(100% + 22px)` with `margin-inline: -11px` and `padding-bottom: 4px`, which lets the active tile's shadow clear the padding.

v16.50 keeps the mark as a 40px tile. The divider is `.dock-logo + .dock-items::before`: 24×1, `margin: 2px auto 6px`. Pinned `.dock-logo { margin-bottom: -4px }`. There is no 49px band.

The default profile is v16.52. Set `data-dock="v16.50"` on `:root` for the 40px dock. A later 16.x release gets its own profile when its dock changes. Until then it uses the default.

## Controls

| Piece | Value |
| --- | --- |
| Button | 28px, radius 8px, 14px / 420. Subtle fill `--surface-gray-2`. Solid `#171717` with white text. Icon button 28×28 |
| Input | 28px, fill `--surface-gray-2`, no border, padding `6px 8px`, radius 8px. Focus `0 0 0 2px rgba(124,124,124,0.25)`. Required text is weight 600. Read-only fill `#f8f8f8` |
| List toolbar | padding `13px 15px` |
| List head | 30px, `--surface-gray-2`, radius 8px, 14px, column labels weight 400, `--ink-gray-6` |
| List row | 41px, 1px `#ededed` bottom border. Subject 14px / 600 / `--ink-gray-8` |
| Checkbox | 14px, radius 4px, 1px `#999` border. Checked fill `#171717` with `border: none` in Desk (the black you read back is the unpainted default). Below 768px the token is 18px. Below 576px a list checkbox is 15px (`list.scss`) |
| Badge | 20px, 12px type, padding `0 6px`, full radius. Subtle is `surface-{c}-2` / `ink-{c}-8` |
| Tabs | strip 42px. Inactive `--ink-gray-5` weight 400. Active `--ink-gray-8` with a 1px bottom border, still weight 400 |
| Field label | 14px / 420 / `--ink-gray-6`, 6px above the control |
| Section head | 14px / 500, padding 15px |
| Form sidebar | 277px |
| Dialog | 575px, radius 12px, 1px `#ededed`, shadow `0 5px 10px rgba(0,0,0,0.1)`. Header padding `7px 15px`, title 16px / 500 `#0f0f0f`. Body and footer padding 15px. Backdrop is `--gray-800` (`#383838`) at opacity 0.8 |
| Menu | radius 12px, padding 6px, items 28px at `6px 8px`, `--ink-gray-7`, `--shadow-2xl` plus a 1px ring. This is not the Espresso `--dropdown-padding` token (`4px 8px`) |

## Dashboard

Number card: padding `12px 16px`, radius 12px, gap 6px, border `--outline-gray-1`. Title 13px `--ink-gray-5`. Value 17px / 600, line-height 1.35. Cards in a group are 15px apart. The next widget group starts 40px below.

Chart card: padding 7px, radius 12px, min-height 240px. Header padding `4px 8px`, title 14px / 500.

## Type and icons

Body: 14px / 420 / 0.02em / `--ink-gray-6`, family InterVariable (Inter 4). Frappe UI's base is 16px / 400 InterVar. Override it in Mode B.

Icon sizes at v16.50: xs 12, sm 16, md 20, lg 24. 22px is `.icon-rail`, added in v16.52 for the dock only.

## 390×844

Dock is not shown. A 20×20 menu button sits in the page head (x=15). The sidebar stays out of view until that button opens it; the open drawer is 224px at x=0 on `--surface-sidebar`. List container (`.result-container`) is x=16, width 360, and clips an inner result that is wider. Below 576px a list row is 67px: 15px checkbox, subject, a 14px / 420 meta line, and the status badge kept on the right. Form controls stack to one column. The form sidebar leaves the layout.

## What this file does not claim

Frappe CRM is not installed here. The 20×42 CRM grid is from CRM source at `47bb9417bd74`, not from a running CRM screen. The v16.50 dock was not booted as a live site.
