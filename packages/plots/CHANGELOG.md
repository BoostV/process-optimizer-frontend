# @process-optimizer-frontend/plots

## 1.1.0

### Minor Changes

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

- 796a24e: Pareto front plot: make the uncertainty band the persistent view and show the 95% confidence ellipse for the front point under the cursor. Remove the visualization-mode toggle — the `paretoVisualizationModes` const, the `ParetoVisualizationMode` type, and the `visualizationMode` / `visualizationModeSelector` props are gone. Add an opt-in `showHoverEllipse` prop on `ParetoFrontPlot` (default off), surfaced as `showParetoHoverEllipse` on the multi-objective `Result`.
- 62b6153: Add multi-objective functionality

### Patch Changes

- e1ed33e: Add simple JSON plot component
- c46297d: Refactor the Pareto plot per code review: decompose `pareto-front-plot.tsx` into focused overlay/projector/hover/label modules, rewrite the hover system on Recharts `usePlotArea` (removing the brittle internal-class `querySelector`), and replace the `cloneElement` button injection with a `renderControls` render prop. Centralize quality negation (`displayQuality`/`displayQualityCI`) and the typed Pareto-plot parser (`parseParetoPlot`/`costDomain`) in core, drive multi-objective score display off canonical score names, and replace the 11 per-reducer `clearParetoSelection` calls with a single selection-invalidation policy. Drop the `as unknown as ExperimentExtrasSelectedPointInner[]` cast via a proper `SelectedPoint` type, and replace the fabricated demo data with a real backend-captured sample.

## 1.0.7

### Patch Changes

- bd25586: Loosen peer dependency version ranges

## 1.0.6

### Patch Changes

- 0b0100d: Update external dependencies

## 1.0.5

### Patch Changes

- 5397e62: Export types properly in manifests

## 1.0.4

### Patch Changes

- d5dabb9: Update dependencies

## 1.0.3

### Patch Changes

- 28a3fd7: Fix bundling error
- a912e3f: Convert plots to ViteJS

## 1.0.2

### Patch Changes

- 739e6b8: Revert conversion to tsc and use vite for all packages

## 1.0.1

### Patch Changes

- 58fbac8: Use plain tsc for building packages

## 1.0.0

### Patch Changes

- First monorepo release
