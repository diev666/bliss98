# Bliss98 JS Modules

This project now keeps the app script split into ordered source modules and builds a single runtime bundle.

## Files

- `assets/js/modules/order.json`: module load/build order.
- `assets/js/modules/*.js`: source modules (edit these).
- `assets/js/bliss98.bundle.js`: generated runtime bundle (loaded by `index.html`).
- `scripts/build-js-bundle.mjs`: build script.

## Build

Run from project root:

```bash
node scripts/build-js-bundle.mjs
```

## Workflow

1. Edit files in `assets/js/modules/`.
2. Rebuild bundle with `node scripts/build-js-bundle.mjs`.
3. Validate with a quick local smoke test.

Do not edit `assets/js/bliss98.bundle.js` directly.
