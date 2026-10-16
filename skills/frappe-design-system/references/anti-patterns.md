# Anti-patterns

Reject these in review.

| Drift | Use instead |
| --- | --- |
| `padding: 24px` on a metric | `--number-card-padding` |
| A 32px page title | 14px medium in the 48px header |
| `font-weight: 400` | 420 |
| Sidebar `width: 15rem` left at the Frappe UI default | `224px` |
| A blue primary button on a Desk page | Gray-900 solid |
| `box-shadow` on a resting card | 1px `--outline-gray-1` |
| Radius 16px on a card | 8px |
| A new icon font | Lucide, or the app duotone sprite |
| A dock tile of 36px or 48px | 40px (v16.50) or 34px (v16.52) |
| Copying ESS dock CSS into a v16.52 Desk page | Do not draw a dock in Mode A |
| "Fixing" ESS tiles from 40px to 34px without a version move | Leave them |
| A 22rem detail panel on a new screen | 277px |
| A second sidebar inside a Desk Page | The Desk sidebar is already there |
| Row height 48px on a desktop list | 30px |
| Tailwind `shadow-lg` because it looks finished | No shadow, unless the layer floats (menu, dialog, slide-over) |
| Spacing `13px` or `18px` | The scales in spacing.md |

If a screen needs a pattern this skill does not list, open the closest file under `apps/frappe/frappe/public/scss/desk/` and record the value before you invent one.
