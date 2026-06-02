---
'@boostv/process-optimizer-frontend-ui': patch
---

Multi-objective results: pin the cost row's 1D plots and histogram to one shared,
data-derived scale (as the quality row already does). The cost histogram's x-axis
was pinned to the Pareto front's cost range while the per-factor band plots
auto-scaled to the selected point, so away from the default point the histogram
no longer matched the 1D graphs (and the front range could clip the
distribution). Now both use `costDisplayDomain` — `[0, max]` over the cost band
bounds and histogram points — so they always cover the same range.
