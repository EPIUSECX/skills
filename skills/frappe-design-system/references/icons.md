# Icons

Two families. Do not add a third.

## Lucide

`frappe/public/icons/lucide.svg`. Sidebar item icons are Lucide names. Frappe UI icons are Lucide. CRM imports `lucide-*` and `@lucide/vue` components (`LucideCalendar` at `size-4`, which is 16px).

Desk does not load the full sprite on every page. The `frappe-desk-navigation` skill is right: an icon only present in `lucide.svg` can draw blank in the Desk sidebar. Use a name that is in the sprite the app includes.

Stroke, from `common/icons.scss`:

- `.icon` stroke-width `1.5px`, round caps and joins
- `.soft-icon` uses `--soft-stroke` default `1.5`
- Color is `--icon-stroke`, often `currentColor`

## Duotone dock glyphs

Rail icons are `*-duotone` symbols from the app sprite registered in `app_include_icons`. ESS uses `ModuleIcon` with names like `icon-bell-duotone` at `size-6` (24px) inside a 40px tile. The Desk `.icon-rail` size is 22px. Inside a v16.50 40px tile, 24px is what ESS ships. Inside a v16.52 34px tile, use 22px so the glyph does not fill the cell. The dock SCSS comment for v16.52 says the glyph is 22px.

## Sizes

| Class | px | Use |
| --- | --- | --- |
| `.icon-xs` | 12 | Inline meta |
| `.icon-sm` / CRM `size-4` | 16 | Sidebar rows, field prefixes |
| `.icon` / `.icon-md` | 20 | Default |
| `.icon-rail` | 22 | Dock glyph on v16.52 |

## Alignment

Dock tiles center the glyph. Sidebar rows use an 8px gap between icon and label. Do not mix filled icon sets with the 1.5 stroke Lucide set in the same row.

## License

Lucide is ISC. This skill does not vendor `lucide.svg` or app sprites. Map names. Draw through the sprite the app already ships.
