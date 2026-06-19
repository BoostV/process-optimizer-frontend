# @boostv/process-optimizer-frontend-ui

## 3.1.2

### Patch Changes

- Updated dependencies [cfd8235]
  - @boostv/process-optimizer-frontend-plots@3.0.1

## 3.1.1

### Patch Changes

- b77e186: Shorten 1d plot score labels

## 3.1.0

### Minor Changes

- dd1b51a: Allow changing the suggested-experiment count for experiments with an active sum
  constraint. The optimizer handles constrained multi-point asks (constant-liar /
  `cl_min`) and the suggestions respect the constraint, so the previous cap to a
  single suggestion is no longer needed.
  - `selectCalculatedSuggestionCountFromExperiment` no longer forces the count to
    1 when a constraint is active (initialization still returns the deficit).
  - Removed `selectIsConstraintActive`'s only remaining consumers; the
    `selectIsSuggestionCountEditable` selector (its sole purpose was the constraint
    lock) is removed.
  - `NextExperiments` no longer disables the count field or shows the
    "cannot be edited while there is a sum constraint" tooltip.

### Patch Changes

- Updated dependencies [dd1b51a]
- Updated dependencies [b459d2d]
  - @boostv/process-optimizer-frontend-core@2.16.0

## 3.0.0

### Major Changes

- 73bcc3b: Update MUI from v6 -> v9

### Patch Changes

- Updated dependencies [73bcc3b]
  - @boostv/process-optimizer-frontend-plots@3.0.0

## 2.15.0

### Minor Changes

- f57a6e6: Introduce new deficit driven experimentation guide

### Patch Changes

- c4d84e9: Fix x-axis label spacing
- 5835636: Reset suggestion count to 1 after the model is first fit
- Updated dependencies [c4d84e9]
- Updated dependencies [5835636]
- Updated dependencies [f57a6e6]
  - @boostv/process-optimizer-frontend-plots@2.0.3
  - @boostv/process-optimizer-frontend-core@2.15.0

## 2.14.3

### Patch Changes

- 0c613b1: Make edit box usable for many parameters
- 190580b: Use shared y-axis for 1D plots when there are many plots
- 469ef54: Click 1D plots to enlarge
- Updated dependencies [190580b]
- Updated dependencies [469ef54]
  - @boostv/process-optimizer-frontend-plots@2.0.2

## 2.14.2

### Patch Changes

- Updated dependencies [5dd1bb0]
  - @boostv/process-optimizer-frontend-core@2.14.1

## 2.14.1

### Patch Changes

- effe024: Tweak varius visual issues
- Updated dependencies [effe024]
  - @boostv/process-optimizer-frontend-plots@2.0.1

## 2.14.0

### Minor Changes

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

### Patch Changes

- Updated dependencies [fb5f32d]
  - @boostv/process-optimizer-frontend-plots@2.0.0
  - @boostv/process-optimizer-frontend-core@2.14.0

## 2.13.4

### Patch Changes

- Updated dependencies [6781f58]
  - @boostv/process-optimizer-frontend-plots@1.1.4

## 2.13.3

### Patch Changes

- ae7ba15: Multi-objective results: pin the cost row's 1D plots and histogram to one shared,
  data-derived scale (as the quality row already does). The cost histogram's x-axis
  was pinned to the Pareto front's cost range while the per-factor band plots
  auto-scaled to the selected point, so away from the default point the histogram
  no longer matched the 1D graphs (and the front range could clip the
  distribution). Now both use `costDisplayDomain` — `[0, max]` over the cost band
  bounds and histogram points — so they always cover the same range.
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

- ec64129: Reset the suggestion count to its default when the model is first fit. While
  initializing, the count is forced to `initialPoints`; once enough data points
  are entered to fit the model it now drops back to 1 instead of "sticking" at the
  initial value. The `Suggestions` input also follows the calculated count, so it
  reflects the change rather than showing a stale value.
- 1aca038: Multi-objective results: render the predicted-score (quality/cost) histograms as
  a smooth curve. The backend sends only the distribution's mean and std, and we
  were drawing it as 5 hardcoded points over ±2σ, which looked like a jagged
  triangular spike. Now sample the normal curve densely (101 points over ±3σ,
  peak-normalized to 1), giving the smooth bell the distribution actually
  describes.
- 4d803e9: Make all plot colors theme-overridable. The plots package now exposes a
  `PlotColors` type and a `usePlotColors()` hook that resolves colors from the MUI
  theme (`palette.plots`), falling back to sensible defaults. Every plot surface
  reads from it — the multi-objective result-row tints, the Pareto uncertainty
  bands, the selected/Pareto-optimal/dominated markers, the front line, the hover
  indicator, the result-card selected accent, and the 1D band / score plot fills.
  A consuming app can restyle the whole result view by setting `palette.plots`
  (quality, cost, band, score, selectedPoint, paretoOptimal, dominated, front).
- Updated dependencies [4775b93]
- Updated dependencies [022d061]
- Updated dependencies [e076b0a]
- Updated dependencies [698ba92]
- Updated dependencies [ec64129]
- Updated dependencies [4d803e9]
  - @boostv/process-optimizer-frontend-plots@1.1.3
  - @boostv/process-optimizer-frontend-core@2.13.1

## 2.13.2

### Patch Changes

- a14ee15: Tweak labels
- Updated dependencies [a14ee15]
  - @boostv/process-optimizer-frontend-plots@1.1.2

## 2.13.1

### Patch Changes

- 1facfa0: Fix minor issues surfaced during integration
- Updated dependencies [1facfa0]
- Updated dependencies [1079505]
  - @boostv/process-optimizer-frontend-plots@1.1.1

## 2.13.0

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

- c46297d: Refactor the Pareto plot per code review: decompose `pareto-front-plot.tsx` into focused overlay/projector/hover/label modules, rewrite the hover system on Recharts `usePlotArea` (removing the brittle internal-class `querySelector`), and replace the `cloneElement` button injection with a `renderControls` render prop. Centralize quality negation (`displayQuality`/`displayQualityCI`) and the typed Pareto-plot parser (`parseParetoPlot`/`costDomain`) in core, drive multi-objective score display off canonical score names, and replace the 11 per-reducer `clearParetoSelection` calls with a single selection-invalidation policy. Drop the `as unknown as ExperimentExtrasSelectedPointInner[]` cast via a proper `SelectedPoint` type, and replace the fabricated demo data with a real backend-captured sample.
- Updated dependencies [75fa90f]
- Updated dependencies [e1ed33e]
- Updated dependencies [796a24e]
- Updated dependencies [c46297d]
- Updated dependencies [62b6153]
  - @boostv/process-optimizer-frontend-core@2.13.0
  - @boostv/process-optimizer-frontend-plots@1.1.0

## 2.12.0

### Minor Changes

- f4fba35: Add multiobjective experiment type to UI

### Patch Changes

- Updated dependencies [f4fba35]
- Updated dependencies [9df0c2b]
- Updated dependencies [bb86856]
  - @boostv/process-optimizer-frontend-core@2.12.0

## 2.11.1

### Patch Changes

- Updated dependencies [272dc90]
  - @boostv/process-optimizer-frontend-core@2.11.1

## 2.11.0

### Minor Changes

- eaf7f39: Add factor delete confirmation
- 0a2142d: Add deletion via selection to data points

## 2.10.6

### Patch Changes

- Updated dependencies [898c7ce]
  - @boostv/process-optimizer-frontend-core@2.11.0

## 2.10.5

### Patch Changes

- bd25586: Loosen peer dependency version ranges
- Updated dependencies [bd25586]
  - @boostv/process-optimizer-frontend-core@2.10.4
  - @boostv/process-optimizer-frontend-plots@1.0.7

## 2.10.4

### Patch Changes

- 0b0100d: Update external dependencies
- Updated dependencies [0b0100d]
  - @boostv/process-optimizer-frontend-plots@1.0.6
  - @boostv/process-optimizer-frontend-core@2.10.3

## 2.10.3

### Patch Changes

- 5397e62: Export types properly in manifests
- Updated dependencies [5397e62]
  - @boostv/process-optimizer-frontend-plots@1.0.5
  - @boostv/process-optimizer-frontend-core@2.10.2

## 2.10.2

### Patch Changes

- 4ee3cdb: Fix peer dependencies

## 2.10.1

### Patch Changes

- d5dabb9: Update dependencies
- Updated dependencies [d5dabb9]
  - @boostv/process-optimizer-frontend-plots@1.0.4
  - @boostv/process-optimizer-frontend-core@2.10.1

## 2.10.0

### Minor Changes

- 4d47233: Rename score to quality
- d63ac4b: Change transfer button label on initial interaction
- 9a4cded: Cap suggestion count

### Patch Changes

- Updated dependencies [4d47233]
- Updated dependencies [9a4cded]
  - @boostv/process-optimizer-frontend-core@2.10.0

## 2.9.0

### Minor Changes

- 53ac66a: Hide single copy of suggestions when initialising

### Patch Changes

- Updated dependencies [a4d75c6]
  - @boostv/process-optimizer-frontend-core@2.9.2

## 2.8.1

### Patch Changes

- 44a5474: Improve calculation of the number of experiments to suggest
- 204abcf: Hide run message while loading
- Updated dependencies [44a5474]
  - @boostv/process-optimizer-frontend-core@2.9.1

## 2.8.0

### Minor Changes

- 3e2da20: Fix experimentation guide state and xi calculation

### Patch Changes

- Updated dependencies [3e2da20]
  - @boostv/process-optimizer-frontend-core@2.9.0

## 2.7.1

### Patch Changes

- dd74832: Resize plots
- Updated dependencies [4ae01df]
  - @boostv/process-optimizer-frontend-core@2.8.0

## 2.7.0

### Minor Changes

- ebe872e: Show single plots in experimentation guide
- f6db4b9: Invert scores to and from backend

### Patch Changes

- Updated dependencies [f6db4b9]
  - @boostv/process-optimizer-frontend-core@2.7.0

## 2.6.0

### Minor Changes

- 6bb276e: Include standard deviation in expected minimum

### Patch Changes

- Updated dependencies [6bb276e]
  - @boostv/process-optimizer-frontend-core@2.6.0

## 2.5.0

### Minor Changes

- d78a230: Update and toggle suggested count based on data points and constraints
- 4779ca3: Validate data point inputs
- a8bfdf4: Add star rating to data points

### Patch Changes

- 9657d33: Update texts for input model
- Updated dependencies [d78a230]
- Updated dependencies [d8188ce]
- Updated dependencies [4779ca3]
- Updated dependencies [a8bfdf4]
  - @boostv/process-optimizer-frontend-core@2.5.0

## 2.4.0

### Minor Changes

- b5ee022: Export InfoBox component (fix for 2.3.0)

## 2.3.0

### Minor Changes

- beceded: Add styling options and export InfoBox component

## 2.2.0

### Minor Changes

- 460b9b2: Add overlay loading mode

## 2.1.0

### Minor Changes

- 29211f1: Add loading skeletons and warnings to cards

### Patch Changes

- 15a6c5e: Add optional external state to message provider, adjust loading skeletons, add missing export
- Updated dependencies [15a6c5e]
  - @boostv/process-optimizer-frontend-core@2.4.0

## 2.0.0

### Major Changes

- 6a09b4a: Add provider for info and error messages

### Patch Changes

- Updated dependencies [6a09b4a]
  - @boostv/process-optimizer-frontend-core@2.3.0

## 1.4.0

### Minor Changes

- d927e77: Add loading state to cards
- ebfff31: Add / remove / edit input model variables

### Patch Changes

- Updated dependencies [aafdfa2]
- Updated dependencies [ebfff31]
  - @boostv/process-optimizer-frontend-core@2.1.0

## 1.3.1

### Patch Changes

- c512d7c: Fix issue where editing breaks after toggling multi objective
- Updated dependencies [d7d66b4]
- Updated dependencies [c512d7c]
- Updated dependencies [82b8489]
  - @boostv/process-optimizer-frontend-core@2.0.0

## 1.3.0

### Minor Changes

- 92517b0: Enable input model editing when data points are present

### Patch Changes

- b83ec77: Enable/disable datapoints
- 9855ae2: Fix tooltip covering buttons
- Updated dependencies [b83ec77]
- Updated dependencies [9015ba2]
- Updated dependencies [92517b0]
- Updated dependencies [47e76d5]
  - @boostv/process-optimizer-frontend-core@1.5.0

## 1.2.0

### Minor Changes

- f915c8a: Introduce Zod for input validation

### Patch Changes

- Updated dependencies [f915c8a]
  - @boostv/process-optimizer-frontend-core@1.4.0

## 1.1.5

### Patch Changes

- 28a3fd7: Fix bundling error
- Updated dependencies [28a3fd7]
- Updated dependencies [a912e3f]
  - @boostv/process-optimizer-frontend-plots@1.0.3

## 1.1.4

### Patch Changes

- f432859: Fix build issues
- Updated dependencies [f432859]
  - @boostv/process-optimizer-frontend-core@1.3.4

## 1.1.3

### Patch Changes

- 739e6b8: Revert conversion to tsc and use vite for all packages
- Updated dependencies [739e6b8]
  - @boostv/process-optimizer-frontend-plots@1.0.2
  - @boostv/process-optimizer-frontend-core@1.3.3

## 1.1.2

### Patch Changes

- 58fbac8: Use plain tsc for building packages
- Updated dependencies [58fbac8]
  - @boostv/process-optimizer-frontend-plots@1.0.1
  - @boostv/process-optimizer-frontend-core@1.3.2

## 1.1.1

### Patch Changes

- 123d09d: Fix various minor issues related to API provider
- 53172b5: Minor fix to API provider
- Updated dependencies [842cb41]
- Updated dependencies [123d09d]
- Updated dependencies [53172b5]
  - @boostv/process-optimizer-frontend-core@1.2.0

## 1.1.0

### Minor Changes

- bc4a713: Stop bundling 3rd party UI components to enable proper theming in clients
- 5512e8d: Add validation of data table
- 213462d: Add feature for copying suggested experiments to data points

### Patch Changes

- Updated dependencies [054c3d3]
- Updated dependencies [1ac0ab2]
- Updated dependencies [5512e8d]
- Updated dependencies [213462d]
  - @boostv/process-optimizer-frontend-core@1.1.0

## 1.0.2

### Patch Changes

- 4966eef: Add remaining theme libraries

## 1.0.1

### Patch Changes

- ae4b2bc: Convert some peer dependencies into actual dependencies

## 1.0.0

### Patch Changes

- First monorepo release
- Updated dependencies
  - @boostv/process-optimizer-frontend-plots@1.0.0
  - @boostv/process-optimizer-frontend-core@1.0.0
