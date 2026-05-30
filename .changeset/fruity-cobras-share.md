---
'@boostv/process-optimizer-frontend-api': patch
'@boostv/process-optimizer-frontend-core': patch
'@boostv/process-optimizer-frontend-plots': minor
'@boostv/process-optimizer-frontend-ui': minor
---

Update all dependencies and restore compatibility across the toolchain.
Notable consumer-facing changes:

- **ui** now requires MUI v6: the `@mui/material` / `@mui/icons-material`
  peer range is pinned to `^6.4.3` (MUI v9 removed system props, `Hidden`
  and `inputProps`, which this codebase still relies on).
- **plots** no longer bundles its styling runtime: `@mui/material` and
  `tss-react` are now declared peer dependencies (the consumer provides
  them), matching the vite 8 / rolldown build.
- The library builds now externalize `react/jsx-runtime` and
  `react/jsx-dev-runtime`; without this the vite 8 / rolldown output emitted
  a `require("react")` shim that crashed the ESM bundles in the browser.
- Internal bumps include React 19.2, recharts 3.8, zod 4.4 (unions now
  emit `oneOf` in generated JSON Schema) and TypeScript 6.0.
