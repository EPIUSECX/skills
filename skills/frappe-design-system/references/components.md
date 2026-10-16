# Components

Kinds:

- **Native** — Desk already renders it. Use it in Mode A.
- **Frappe UI** — configure it. Frappe UI 1.0.0.
- **App** — draw it only when neither of the above fits. Start from `assets/templates/shell.css`.

| Component | Kind | Implementation | Size |
| --- | --- | --- | --- |
| ApplicationShell | Native in Desk. Frappe UI `DesktopShell` in a SPA | Do not nest one inside the other | viewport |
| DesktopNavigation | Native `/desk` | Apps tiles. No rail | |
| ModuleDock | Native `.dock`. App `DockRail` in ESS and Cargo | See navigation.md for 40px vs 34px | 57px pinned |
| WorkspaceSidebar | Native `.body-sidebar`. Frappe UI `Sidebar` | Set `width="224px"` | 224 / 48 |
| PageHeader | Native `.page-head`. Frappe UI `PageHeader` | One per page | 48px, measured border box 49px |
| Breadcrumbs | Native header. CRM `ViewBreadcrumbs` | In the header, not under it | 16px / 500. Parent ink-gray-5, current ink-gray-9 |
| PrimaryActions | `.es-button[data-variant=solid]` or Frappe UI `Button variant="solid"` | Gray-900, white text. One per header | 28px sm |
| SecondaryActions | `data-variant="subtle"` (the default) or `outline` | Subtle is the Desk default | 28px |
| SearchInput | Frappe UI `TextInput` or `.search` | Height 28px, radius 8px | 28px |
| FilterBar | Desk list filters. Frappe UI `Dropdown` / CRM `QuickFilterField` | Sit in the header row, 8px gap | |
| DataTable | Desk list view. Frappe UI list components | Row token 30px | see tables.md |
| StatusBadge | `.es-badge` or Frappe UI `Badge` | Pill, height 20px, 12px type | |
| MetricCard | Desk `.number-widget-box` | No resting shadow | padding 12px 16px, radius 12px, value 17px / 600 |
| DashboardCard | CRM grid item | 20 columns, 42px rows, padding 8px | dashboards.md |
| FormSection | Desk form layout. CRM `CollapsibleSection` | Header 32px (`h-8`) in CRM | |
| FormField | Native control or Frappe UI `FormControl` | Label 14px / 420 ink-gray-6, control 28px, no border | forms.md |
| Tabs | `.es` tab styles, Frappe UI `Tabs` / `TabButtons` | Desk form tabs sit under the header | |
| DropdownMenu | Frappe UI `Dropdown` | radius 12px, padding 6px, item 28px, `--shadow-2xl`. Not `--dropdown-padding` and not `--shadow-md` | |
| ModalDialog | Frappe UI `Dialog`. Desk `$modal-md` is 575px | Measured Rename dialog: 575×221, content radius 12px, shadow `0 5px 10px rgba(0,0,0,0.1)` | |
| ContextDrawer | Desk `.side-panel` | `clamp(380px, 46vw, 780px)`, shadow lg, 200ms | right-panels.md |
| RightDetailPanel | Desk `.form-sidebar` or CRM `SidePanelLayout` | 277px, or 35/65 fields | right-panels.md |
| EmptyState | Frappe UI empty pattern. ESS `EmptyState.vue` | Centered, no illustration larger than 48px | |
| LoadingState | Frappe UI `LoadingIndicator` / `Spinner`. ESS `Spinner.vue` | Use the spinner, not a custom bar, unless the app already has `TopProgress` | |
| NotificationToast | `.es` toast, Frappe UI `Toast` | | |

## Button

Source: `css/espresso/components/button.css`. Frappe UI `Button.vue` uses the same scale (`h-7` is 28px).

| Size | Height | Inline padding | Type | Radius |
| --- | --- | --- | --- | --- |
| xs | 24px | 6px | 12px | 6px |
| sm (default) | 28px | 8px | 14px / 420 | 8px |
| md | 32px | 10px | 14px / 500 | 8px |
| lg | 40px | 12px | 17px / 500 | 10px |

Variants: `subtle` (default), `solid`, `outline`, `ghost`. Themes in the CSS file: `gray` (default) and `red`. Frappe UI also ships blue and green theme maps. Prefer gray solid for the primary action so it matches Desk. Transition `120ms` on background, border, and color.

Icon button: square, same height, no inline padding.

## Badge

Source: `components/badge.css`. Default height `calc(var(--spacing) * 5)` = 20px, padding inline 6px, radius full, weight 420, font `0.75rem`. Variant default `subtle`.

## States

| State | Rule |
| --- | --- |
| Hover | `--surface-gray-2` on ghost/subtle. Solid moves from gray-10 to gray-9 |
| Active | One step darker than hover. An open menu keeps the trigger pressed via `aria-expanded` |
| Focus | `--focus-outline-default`, 2px. Do not remove the outline |
| Disabled | `--surface-gray-2` background, `--ink-gray-4` text. Loading does not use the disabled dimming (`aria-busy`) |

## Anti-patterns

A second button system. A 36px or 44px control. A blue primary button on a Desk page. A badge with a hard corner.
