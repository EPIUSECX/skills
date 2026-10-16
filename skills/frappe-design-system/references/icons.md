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

Rail icons are `*-duotone` symbols from the app sprite registered in `app_include_icons`. ESS uses `ModuleIcon` with names like `icon-bell-duotone` at `size-6` (24px) inside a 40px tile, which matches v16.50 (`--icon-lg`). v16.52 adds `.icon-rail` at 22px for the 34px tile. Do not put a 22px glyph in a v16.50 dock.

## Sizes

| Class | px | Use |
| --- | --- | --- |
| `.icon-xs` | 12 | Inline meta |
| `.icon-sm` / CRM `size-4` | 16 | Sidebar rows, field prefixes |
| `.icon` / `.icon-md` | 20 | Default. v16.50 dock Lucide glyph |
| `.icon-lg` | 24 | v16.50 dock duotone glyph |
| `.icon-rail` | 22 | Dock glyph on v16.52 only |

## Alignment

Dock tiles center the glyph. Sidebar rows use an 8px gap between icon and label. Do not mix filled icon sets with the 1.5 stroke Lucide set in the same row.

## License

Lucide is ISC. This skill does not vendor `lucide.svg` or app sprites. Map names. Draw through the sprite the app already ships.
