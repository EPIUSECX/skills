# Navigation

The information architecture is in the `frappe-desk-navigation` skill: Apps tile, Dock document, Sidebar document, Lucide names, duotone sprites. This file is the geometry.

## Apps screen

`/desk` is the desktop. Tiles sit on a white page. There is no left rail on that screen. Evidence: `assets/screenshots/desktop-1440x900.png`.

At 390×844 the same page stacks the tiles in one column. Evidence: `assets/screenshots/desktop-390x844.png`. The sidebar token is still 224px, but the desktop does not show a module sidebar.

## Dock

Source: `frappe/public/scss/desk/dock.scss`.

Shared by v16.50.0 and v16.52.0:

- Tray width `--dock-width: 56px`
- Pinned width `calc(var(--dock-width) + 1px)` → 57px. Measured 57 on the User list.
- Pinned: in flow, full viewport height, radius 0, no shadow, `border-right: 1px solid var(--outline-gray-1)`
- Floating: `position: fixed; left: 8px; top: 50%`, radius 18px, `--shadow-2xl`, transform `0.28s cubic-bezier(0.4, 0, 0.2, 1)`
- v16.50 glyphs are Lucide at `--icon-md` (20px) or a duotone at `--icon-lg` (24px), stroke 1.5. `.icon-rail` (22px) exists only in v16.52.

Different:

| | v16.50.0 (`data-dock="v16.50"`) | v16.52.0 (default, this bench) |
| --- | --- | --- |
| `--dock-tile` | 40px | 34px |
| Gap | 6px | `var(--spacing)` (4px) |
| Padding | 8px, then pinned `padding-top: 4px` → `4px 8px 8px` | `8px 11px 12px` (measured on `.dock`) |
| Tile radius | 12px | `var(--radius-4)` (8px) |
| Idle ink | `--ink-gray-7` | `--ink-gray-5` |
| Active ink | `--ink-gray-9` | `--ink-gray-8` |
| Tile hover | Ink only. No fill. The SCSS comment says "a step in ink and no fill" | Fill `--surface-gray-2`, ink `--ink-gray-7` |
| Active fill | `rgba(0,0,0,0.12)` | `--surface-elevation-3` plus `--shadow-sm` |
| Glyph | 20px Lucide, 24px duotone | 22px `.icon-rail` |

`--dock-tile-hover` (`rgba(0,0,0,0.07)` in light) is the user-menu button fill, not the tile hover.

Cohenix ESS `DockRail.vue` and Cargo `shell.css` implement the v16.50 column (40px tiles, 12px radius, 6px gap). That matches `dock.scss` at v16.50.0 and not the v16.52.0 file. Keep their 40px tiles until that product moves. New work on 16.52 or later uses the default profile.

## Sidebar

Source: `frappe/public/scss/desk/sidebar.scss`. Identical at both tags.

- `--sidebar-width: 224px` (comment: 14rem)
- `--sidebar-collapsed-width: 48px` (comment: 3rem)
- Background `--desk-sidebar-bg`, which is `--surface-sidebar` (`#f8f8f8`) in light
- Border right `1px solid var(--outline-gray-1)`
- Width transition `0.3s ease-in-out`
- Row hover: `--surface-gray-2`, radius `--radius` (8px)

Measured on the User list at 1440×900: x=57, width=224, height=900, background `rgb(248, 248, 248)`.

Frappe UI `Sidebar` defaults to 15rem. Override it.

## Page header

`--page-head-height: 48px` and `--navbar-height: 48px`. The measured border box of `.page-head` is 49px because of the bottom border. Title padding in `page.scss` is `0 15px`. That 15px is the legacy `--padding-md`, not an Espresso step.

## Breadcrumbs

The breadcrumb is the title: 16px / 500, line-height 24px, padding `4px 2px`. A parent crumb is `--ink-gray-5`. The current crumb is `--ink-gray-9`. Keep it in the header row. Do not add a second title band under it.

## User menu

On the Apps screen the avatar is at the top left of the page. Inside an app the v16.52 dock puts the user control at the foot of the dock (visible in the list screenshot). ESS and Cargo do the same for the collapsed rail.
