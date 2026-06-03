---
'@boostv/process-optimizer-frontend-plots': major
'@boostv/process-optimizer-frontend-ui': minor
'@boostv/process-optimizer-frontend-core': minor
---

Multi-objective plot theming and result improvements.

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
- `OneDData` gains an optional `objective` field used to pick the per-objective
  fill.

**Core:** new `displayCostCI(value, stdDev)` helper — the cost objective's 95%
credible interval (`value ± 1.96·σ`, no negation; mirrors `displayQualityCI`).

**UI:** multi-objective results now show each objective's predicted settings and
95% credible-interval limits beneath each 1D plot (parity with the
single-objective view); displayed settings are rounded.
