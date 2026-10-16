# Mode B example

A Vue app on Frappe UI 1.0.0 (the same versions as Cohenix ESS) with the Desk overrides in `src/style.css`.

`node_modules` is not committed. Point it at an install that already has these versions, or install here:

```bash
ln -s /path/to/cohenix_ess/frontend/node_modules node_modules
npm run dev    # http://127.0.0.1:5180
```

Compare it with a running Desk:

```bash
node scripts/compare-pages.mjs tests/visual/parity-users.json
```
