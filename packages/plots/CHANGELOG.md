# @process-optimizer-frontend/plots

## 3.0.0

### Major Changes

- 73bcc3b: Update MUI from v6 -> v9

## 2.0.3

### Patch Changes

- c4d84e9: Fix x-axis label spacing

## 2.0.2

### Patch Changes

- 190580b: Use shared y-axis for 1D plots when there are many plots
- 469ef54: Click 1D plots to enlarge

## 2.0.1

### Patch Changes

- effe024: Tweak varius visual issues

## 2.0.0

### Major Changes

- fb5f32d: Multi-objective plot theming and result improvements.

  **Plots — `palette.plots` restructured into nested sections (breaking).**
  Plot colors are now grouped by the surface they style: `row` (result-row
  tints), `oneD` (per-objective 1D plot fills — `qualityBand`/`qualityScore`,
  `costBand`/`costScore` — plus `band`/`score` as the single-objective
  fallback), `pareto` (uncertainty bands, `optimal`/`dominated` markers, the
  `front` line and the selected-point crosshair `guide`), plus a top-level
  cross-cutting `selectedPoint` accent. `usePlotColors()` deep-merges each
  section over the defaults, so a partial override (e.g. only
  `pareto.costBand`) keeps the other defaults.

  > **Breaking:** `palette.plots` overrides must migrate from the old flat keys
  > (`quality`, `band`, `qualityBand`, `paretoOptimal`, …) to the nested shape.

  **Plots — other changes:**
  - Pareto uncertainty bands are themed independently from the 1D plot colors,
    and their opacity now comes from the color's alpha channel (`#RRGGBBAA`)
    rather than a fixed `fillOpacity`; band edges stay crisp.
  - The selected-point guides on the Pareto and 1D plots now run all the way to
    the axes and render on top of the data series, instead of stopping at the
    front / sitting beneath it. The two surfaces' guide colors are separate
    (`pareto.guide` and `oneD.referenceLine`).
  - `ParetoFrontPlot` gains a `hideLegend` prop and honours `width` / `height` /
    `maxWidth` so it can be embedded at a custom size.
  - The Pareto legend now shows the selected point's quality/cost coordinate
    (e.g. `Quality ≈ 1.51, Cost ≈ 0.67`) alongside its factor settings.
  - `OneDData` gains an optional `objective` field used to pick the per-objective
    fill.

  **Core:** new `displayCostCI(value, stdDev)` helper — the cost objective's 95%
  credible interval (`value ± 1.96·σ`, no negation; mirrors `displayQualityCI`).

  **UI:** multi-objective results now show each objective's predicted settings and
  95% credible-interval limits beneath each 1D plot (parity with the
  single-objective view); displayed settings are rounded.

## 1.1.4

### Patch Changes

- 6781f58: Tweak the transparency of the pareto plot

## 1.1.3

### Patch Changes

- 4775b93: Multi-objective results: rename the default Pareto selection from "optimal" to
  "default". We don't know how the user weights quality vs cost, and the default
  only assumes an equal (1:1) balance — so "optimal" was misleading. The header
  chip now reads "Default point" (and "Selected point" once the user picks a point
  on the Pareto front), the caption explains it as the model's default equal
  balance, the reset controls say "default", and the Pareto hover tooltip reads
  "Target — default point". The mathematical term "Pareto-optimal observation" is
  unchanged.
- 022d061: Multi-objective results: give the quality/cost score histograms a consistent
  x-axis. Recharts' default left only 2-3 sparse ticks (e.g. the quality
  histogram showed just 2 and 5). Now draw a fixed set of 6 evenly-spaced ticks
  spanning 0..max (both ends included), and anchor the cost histogram's domain at
  0 (quality already started there) so both read 0 → max. A small axis inset keeps
  the 0 and max labels from clipping at the chart edges.
- e076b0a: Multi-objective results: make the per-objective rows easier to read and unify the
  objective colors.
  - Group each objective's plots into a faintly tinted band labelled "Quality" /
    "Cost".
  - Move the factor titles (Magnesium, Potassium, …) below their plots, where they
    read as the plot's x-axis label.
  - Introduce shared `qualityColor` (blue) and `costColor` (amber) plus a `withAlpha`
    helper in the plots package, and use them for both the result-row tints and the
    Pareto-front uncertainty bands (and legend), so each objective reads
    consistently across the UI.

- 698ba92: 1D band plots: make the hover tooltip clearer. The top line now prefixes the
  x value with `x: `, and the value is shown as an explicit credible-interval
  range `[low to high]` instead of a bare comma-separated pair. Histograms are
  unaffected (they have no tooltip).
- 4d803e9: Make all plot colors theme-overridable. The plots package now exposes a
  `PlotColors` type and a `usePlotColors()` hook that resolves colors from the MUI
  theme (`palette.plots`), falling back to sensible defaults. Every plot surface
  reads from it — the multi-objective result-row tints, the Pareto uncertainty
  bands, the selected/Pareto-optimal/dominated markers, the front line, the hover
  indicator, the result-card selected accent, and the 1D band / score plot fills.
  A consuming app can restyle the whole result view by setting `palette.plots`
  (quality, cost, band, score, selectedPoint, paretoOptimal, dominated, front).

## 1.1.2

### Patch Changes

- a14ee15: Tweak labels

## 1.1.1

### Patch Changes

- 1facfa0: Fix minor issues surfaced during integration
- 1079505: Fix minor issues surfaced by integrating the library into products

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
