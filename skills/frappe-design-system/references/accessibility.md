# Accessibility

## Names

- The dock is a landmark (`aria-label="Main"` on the ESS dock).
- The sidebar is a `<nav>` in Frappe UI. Do not nest a second `<nav>` inside it. Frappe UI's comment says section bodies are `role="group"`.
- Icon-only tiles need a tooltip and an accessible name. ESS uses `Tooltip` plus `aria-label`.
- The current page sets `aria-current="page"`.

## Focus

Every control shows `--focus-outline-default` on `:focus-visible`. The dock tile uses `outline: 2px solid var(--outline-gray-4)` and `outline-offset: 2px` (`dock.scss`). Keep a visible ring. Do not rely on color alone for the active tile: the active tile also changes weight of the background.

## Keyboard

- Buttons and links are real `<button>` and `<a>`.
- Escape closes a menu, dialog, and the search palette.
- A dialog traps focus and returns it to the trigger.
- Table rows that open a panel are buttons or links, or they have `tabindex="0"` and an Enter handler.

## Contrast

Primary text `#171717` on `#ffffff` passes. Muted labels `#7c7c7c` on white are the Desk label color. Do not lighten them further. A status badge uses the pale surface with the darker ink from colors.md, not white text on a light green.

## Motion

Honor `prefers-reduced-motion`. Icon sprites in ESS read `--icon-motion`. Set it to `paused` under that query.

## Forms

Labels are wired with `for` / `id`. Required fields show a text marker (CRM uses `*`). Errors are text, not only a red border.
