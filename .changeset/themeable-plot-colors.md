---
'@boostv/process-optimizer-frontend-plots': patch
'@boostv/process-optimizer-frontend-ui': patch
---

Make all plot colors theme-overridable. The plots package now exposes a
`PlotColors` type and a `usePlotColors()` hook that resolves colors from the MUI
theme (`palette.plots`), falling back to sensible defaults. Every plot surface
reads from it — the multi-objective result-row tints, the Pareto uncertainty
bands, the selected/Pareto-optimal/dominated markers, the front line, the hover
indicator, the result-card selected accent, and the 1D band / score plot fills.
A consuming app can restyle the whole result view by setting `palette.plots`
(quality, cost, band, score, selectedPoint, paretoOptimal, dominated, front).
