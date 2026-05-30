# @process-optimizer-frontend/api

## 1.5.1

### Patch Changes

- 75fa90f: Update all dependencies and restore compatibility across the toolchain.
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

## 1.5.0

### Minor Changes

- 898c7ce: Update external dependencies

## 1.4.3

### Patch Changes

- 0b0100d: Update external dependencies

## 1.4.2

### Patch Changes

- 5397e62: Export types properly in manifests

## 1.4.1

### Patch Changes

- d5dabb9: Update dependencies

## 1.4.0

### Minor Changes

- d9b45b8: Update backend API version

## 1.3.0

### Minor Changes

- d925eae: Include standard deviation in expected minimum
- 6bb276e: Include standard deviation in expected minimum

## 1.2.0

### Minor Changes

- a1079a4: Support constraints
- 4ae497f: Update API to v3.2.0

## 1.1.4

### Patch Changes

- c49168d: Fix budling

## 1.1.3

### Patch Changes

- f432859: Fix build issues

## 1.1.2

### Patch Changes

- 739e6b8: Revert conversion to tsc and use vite for all packages

## 1.1.1

### Patch Changes

- 58fbac8: Use plain tsc for building packages

## 1.1.0

### Minor Changes

- 054c3d3: Add support for authentication

### Patch Changes

- 666eccb: Add support for plotting expected minimum in objective plots
- 1ac0ab2: Request the correct number of suggestions

## 1.0.0

### Patch Changes

- First monorepo release
