# Visual audit

JSON files are `getBoundingClientRect` and `getComputedStyle` dumps from Chrome on `ess.localhost` (Frappe v16.52.0). PNG files with the same stem live in `assets/screenshots/`.

| File | Viewport | Page |
| --- | --- | --- |
| `desktop-1440x900` | 1440×900 | `/desk` Apps screen |
| `desktop-1280x800` | 1280×800 | `/desk` |
| `desktop-1920x1080` | 1920×1080 | `/desk` |
| `desktop-390x844` | 390×844 | `/desk` |
| `workspace-1440x900` | 1440×900 | Click on the desktop returned to `/desk`. Not a workspace. |
| `list-user-1440x900` | 1440×900 | User list. Sidebar 224, dock 57, head 49 |
| `form-1440x900` | 1440×900 | Row click did not open the form. Ignore this file for form geometry |
| `search-1440x900` | 1440×900 | Ctrl+K did not open search. Still the list |
| `form-user-1440x900.png` | 1440×900 | User form. Sidebar of the form measured 277px in a later pass |

Later captures, from the gap pass:

| File | What it is |
| --- | --- |
| `list-row-trace.json` | Why a data row is 41px and the header token is 30px |
| `search.json` / `modal.json` | Awesome bar and a Rename dialog, both 575px wide |
| `form-anatomy.json` | Tabs, columns, and the 277px sidebar on the User form |
| `dark.json` | Custom properties after `data-theme="dark"` |
| `workspace.json` | Accounting onboarding widget padding |
| `list-1280x800.json`, `list-1920x1080.json`, `list-390x844.json` | List shell at the other viewports |
| `form-1280x800.json`, `form-1920x1080.json`, `form-390x844.json` | Form shell at the other viewports |

`comparison.json` is written by `scripts/compare-screenshots.mjs` after the example geometry test.

A zero width on `.dock` or `.body-sidebar` on the Apps screen means the element is in the DOM and not in the layout. It does not mean the token is 0. The token dump on the same file still says `--sidebar-width: 224px`.
