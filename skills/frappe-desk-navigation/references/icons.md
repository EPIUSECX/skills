# Icons: logo, dual-tone sprite, Lucide names

## Which icon set goes where

| Where | Set | Example |
|---|---|---|
| Apps-screen tile | the app's own SVG logo (`add_to_apps_screen.logo`) | `/assets/erpnext/images/erpnext-logo.svg` |
| Dock (rail) entry, Sidebar `header_icon` | `*-duotone` symbol from an app sprite | `gantt-chart-duotone`, `myapp-gear-duotone` |
| Sidebar items, Workspace `icon`, Desktop Icon `icon` | Lucide (Frappe's sprite) | `house`, `folder-kanban`, `chart-column` |
| Avoid | Timeless (legacy v14/v15 set, still loaded) | `home`, `tool`, `chart`, `projects` |

The dock decides an entry is dual-tone purely by the `-duotone` suffix (`frappe/public/js/frappe/ui/sidebar/dock.js`).

## Look up an icon name on the bench

```bash
# Is it a valid icon, and from which set?
python3 - <<'EOF'
import re, glob
want = ["house", "wrench", "tool"]
for f in glob.glob("apps/*/*/public/icons/**/*.svg", recursive=True):
    ids = set(re.findall(r'id="icon-([^"]+)"', open(f).read()))
    for w in want:
        if w in ids: print(w, "->", f)
EOF
# Browse Lucide names that contain a word
grep -o 'id="icon-[^"]*gear[^"]*"' apps/frappe/frappe/public/icons/lucide/icons.svg
```

## Timeless → Lucide (observed in ERPNext's own v16 conversion)

| Timeless (legacy) | Lucide (v16) | Notes |
|---|---|---|
| `home` | `house` | `chart-column` when the link is a Dashboard |
| `chart` | `chart-column` | report links; section header for Reports uses `sheet` |
| `projects` | `folder-kanban` | |
| `customer` | `user` | |
| `buying` | `shopping-cart` | |
| `assets` | `building` | |
| `organization` | `building-complex` | |
| `liabilities` | `receipt-text` | |
| `quality` | `target` | |
| `review` | `clipboard-check` | |
| `tool` | `wrench` | also `hammer`, `drill` |
| `message` | `message-square` | |
| `message-1` | `messages-square` | |
| `integration` | `plug` | |
| `branch` | `git-branch` | |
| `education` | `graduation-cap` | |
| `folder-normal` | `folder` | |
| `getting-started` | `rocket` | |
| `onboarding` | `list-checks` | |
| `setting`, `setting-gear` | `settings` | |
| `alert` *(in no sprite: renders blank)* | `triangle-alert` | |
| `data` *(in no sprite: renders blank)* | `database` | |
| `list` | `list` | same name exists in both; Lucide wins |
| `settings` | `settings` | same name exists in both; Lucide wins |
| `grid` | `layout-grid` | |

## Feather / pre-1.0 Lucide names (render **blank**: they exist in no v16 sprite)

Apps written against Feather or early Lucide use names that Lucide later renamed, noun first. They
don't fall back to anything; the row just has no icon. `refine_sidebars.py` maps them.

| Old name | Lucide (v16) |
|---|---|
| `alert-triangle` | `triangle-alert` |
| `alert-circle` | `circle-alert` |
| `check-circle` | `circle-check` |
| `x-circle` | `circle-x` |
| `help-circle` | `circle-question-mark` (not `circle-help` in this build) |
| `bar-chart` | `chart-bar` |
| `bar-chart-2` | `chart-column` |
| `pie-chart` | `chart-pie` |
| `line-chart` | `chart-line` |
| `edit`, `edit-2` | `pencil` |
| `more-horizontal` / `more-vertical` | `ellipsis` / `ellipsis-vertical` |

Not on the list? Choose by meaning from Lucide, and confirm it with the lookup above. The audit script
warns on any Timeless name and fails on a name found in no sprite.

## App logo template (Apps-screen tile)

Same geometry as ERPNext's logo: a 100×100 rounded square with a white glyph that sits roughly inside x 27–73
and y 24–76.

```svg
<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M71.4286 0H28.5714C12.7919 0 0 12.7919 0 28.5714V71.4286C0 87.2081 12.7919 100 28.5714 100H71.4286C87.2081 100 100 87.2081 100 71.4286V28.5714C100 12.7919 87.2081 0 71.4286 0Z" fill="#EA580C"/>
<path d="M27 75V25H37.6L50 44.6L62.4 25H73V75H63V42.2L53.6 57H46.4L37 42.2V75H27Z" fill="white"/>
</svg>
```
Save it as `<app>/public/images/<app>-logo.svg`. Fills already in use: ERPNext `#0089FF`, Frappe HR teal,
Framework grey. Keep the white glyph large enough to pass contrast. It is a single
bold shape, not text.

## Dual-tone sprite template (`<app>/public/icons/module-icons.svg`)

```xml
<!-- Dual-tone module icons for the desk dock and sidebar headers. Symbols fill from the
     duotone-light and duotone-dark custom properties; Frappe's own sprite holds the tone rules.
     NEVER put two hyphens in a row inside this comment: it makes the SVG invalid. -->
<svg id="<app>-module-symbols" aria-hidden="true" style="display: none;" class="icon" xmlns="http://www.w3.org/2000/svg">
	<style>
		/* Optional motion, played only while the dock tile is hovered. */
		@media (prefers-reduced-motion: no-preference) {
			.<prefix>-gear-turn {
				transform-box: view-box;
				transform-origin: 12px 12px;
				animation: <prefix>-gear-turn 2.4s linear infinite;
				animation-play-state: var(--icon-motion, paused);
			}
		}
		@keyframes <prefix>-gear-turn { to { transform: rotate(45deg); } }
	</style>

	<symbol viewBox="0 0 24 24" id="icon-<prefix>-gear-duotone" stroke="none">
		<g class="<prefix>-gear-turn">
			<!-- light tone: background parts -->
			<rect x="10.6" y="1.8" width="2.8" height="4.2" rx="0.8" transform="rotate(0 12 12)"
				style="fill: var(--duotone-light, var(--ink-gray-3))" />
			<!-- ...repeat the tooth at 45, 90 ... 315 -->
			<!-- dark tone: the main body -->
			<circle cx="12" cy="12" r="7.2"
				style="fill: var(--duotone-dark, light-dark(var(--ink-gray-5), var(--ink-gray-6)))" />
			<circle cx="12" cy="12" r="2.9" style="fill: var(--duotone-light, var(--ink-gray-3))" />
		</g>
	</symbol>
</svg>
```

Rules, taken from Frappe's and ERPNext's own sprites:
- `viewBox="0 0 24 24"`, `stroke="none"`, and id `icon-<name>-duotone` (the desk prepends `icon-`).
- Fill only from `var(--duotone-light, var(--ink-gray-3))` and
  `var(--duotone-dark, light-dark(var(--ink-gray-5), var(--ink-gray-6)))`. Never hard-code colours: the
  tile, the hover state, the active state and dark mode all retint through these two properties.
- For motion, use `--icon-motion` (`animation-play-state`) or `--icon-motion-opacity` (0→1 on hover),
  inside `prefers-reduced-motion: no-preference`.
- Prefix class names and keyframes with the app. Every app's sprite shares one document stylesheet.
- Validate with `xmllint --noout module-icons.svg`.
- Register it with `app_include_icons = ["/assets/<app>/icons/module-icons.svg"]`. No build step is needed: `public/`
  is symlinked into `assets/`.
