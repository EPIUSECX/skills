# Vue 3 + frappe-ui + Vite Frontend

Some apps have a standalone Vue 3 frontend in a `frontend/` directory. This is a full SPA that talks to Frappe via API calls.

## Structure

```
apps/<app>/
  frontend/
    src/
      main.js          # app entry
      App.vue          # root component
      pages/           # route views
      components/      # reusable components
      router.js        # vue-router setup
      composables/     # Vue composables
    index.html
    vite.config.js     # .js, .mjs or .ts
    package.json
    tailwind.config.js
  package.json         # root: {"scripts": {"build": "cd frontend && yarn build"}} for bench build
  <app>/
    hooks.py           # website_route_rules to serve the SPA
    www/
      <route>.html     # the built index.html, copied here by the build
      <route>.py       # boot context for the page (usually no_cache = 1)
```

## Key dependencies

- `vue` (3.x), `vue-router`, `frappe-ui` — UI framework with Frappe-aware components
- `vite` with `@vitejs/plugin-vue` — build tool
- `frappe-ui` vite plugin — handles dev proxy to Frappe backend, type generation

## vite.config.ts

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(async () => {
  const { default: frappeui } = await import('frappe-ui/vite')

  return {
    plugins: [
      frappeui({
        frontendRoute: '/myapp',       // route prefix; newer frappe-ui (1.0 betas) only.
                                        // Older 0.1.x needs buildConfig.indexHtmlPath instead.
        frappeTypes: {                  // auto-generate TypeScript types for DocTypes
          input: {
            myapp: ['my_doctype'],
          },
        },
      }),
      vue(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  }
})
```

## hooks.py route

Wire the SPA route in `hooks.py` so Frappe serves the Vue app:

```python
website_route_rules = [
    {"from_route": "/myapp/<path:app_path>", "to_route": "myapp"},
]
```

## Development

```bash
cd apps/<app>/frontend
yarn install
yarn dev            # starts Vite dev server with HMR (proxies API to Frappe)
```

The Vite dev server proxies `/api` calls to the running Frappe backend (`bench start` must be running).

## Production build

```bash
cd apps/<app>/frontend
yarn build          # outputs to apps/<app>/<app>/public/frontend
```

Or via bench:
```bash
bench build --app <app-name>
```

`bench build` runs `yarn build` in the app root, not in `frontend/`. It works only if the root `package.json` has a `build` script that builds the frontend.

## Calling Frappe APIs from Vue

frappe-ui provides composables for data fetching:

```javascript
import { useCall, useList, useDoc } from 'frappe-ui'

// API call
const result = useCall({
  url: '/api/v2/method/myapp.api.get_summary',
  method: 'POST',
  immediate: false,        // set true to call on mount
  onSuccess: (data) => {
    console.log(data)
  },
})
result.submit({ status: 'Draft' })  // call with params (fetch() and execute() take none)

// Document list
const expenses = useList({
  doctype: 'Expense',
  fields: ['name', 'title', 'amount', 'status'],
  filters: { status: 'Draft' },
})
// expenses.data — reactive list
// expenses.reload() — refetch

// Single document
const expense = useDoc({
  doctype: 'Expense',
  name: 'EXP-0001',
})
// expense.doc — reactive document data
// expense.doc.title — access fields
// expense.setValue.submit({ status: 'Approved' }) — update fields
```
