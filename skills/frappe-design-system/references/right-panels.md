# Right panels

Three different panels. Pick one.

## 1. Form sidebar (record facts)

Source: `desk/form_sidebar.scss`.

- `--form-sidebar-width: 277px`
- Measured on User Administrator at 1440×900: 277px
- Avatar token `--form-sidebar-image-width: 80px`. The User form showed a 64px-looking avatar in the screenshot description; the token is 80px. Use 80px for a new form sidebar image.
- Sections padded `--padding-md` (15px)
- Assigned-to and attachments live here
- Background white, no slide animation. It is part of the form.

The detail example uses this width.

## 2. Desk slide-over

Source: `desk/side_panel.scss`.

- `--side-panel-min-width: 380px`
- `--side-panel-width: clamp(380px, 46vw, 780px)`
- Fixed, top at navbar height, `border-left`, `--shadow-lg`
- Closed: `right: calc(-1 * width)`. Open: `right: 0`. Transition `200ms ease`
- Below the `md` breakpoint (768px): width `100vw`
- z-index 1010
- The body is a form layout. Do not restyle the fields inside it.

Use this when a list opens a record without leaving the list. Do not use it for a 277px fact column.

## 3. CRM side panel

Source: `frontend/src/components/SidePanelLayout.vue` at `47bb9417bd74`.

- Sections stacked, divided by a 1px top border
- Section padding `p-1` / `sm:p-3`
- Collapsible header `h-8`, label semibold, horizontal padding 8px
- Fields: `gap-1.5`, row padding `px-3`, label column `w-[35%]` min 20, value `w-[65%]`
- Label 13px `--ink-gray-5`. Value 14px, min-height 28px
- Required mark `--ink-red-4` (the class in the file is `text-ink-red-4`)

Cargo `SidePanel.vue` is a third width: `w-[22rem]` (352px) and a 52px header (`h-[3.25rem]`). That is app-specific. It is not the form sidebar and not the CRM field grid. New record panels in this system use 277px or the CRM 35/65 rows inside that column. Do not add another width.

## Responsive

From 1440 down to 1280 the 277px panel stays put. Below 768px it covers the content (`examples` CSS). The slide-over already does that in Desk.
