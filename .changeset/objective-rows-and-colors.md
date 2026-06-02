---
'@boostv/process-optimizer-frontend-ui': patch
'@boostv/process-optimizer-frontend-plots': patch
---

Multi-objective results: make the per-objective rows easier to read and unify the
objective colors.

- Group each objective's plots into a faintly tinted band labelled "Quality" /
  "Cost".
- Move the factor titles (Magnesium, Potassium, …) below their plots, where they
  read as the plot's x-axis label.
- Introduce shared `qualityColor` (blue) and `costColor` (amber) plus a `withAlpha`
  helper in the plots package, and use them for both the result-row tints and the
  Pareto-front uncertainty bands (and legend), so each objective reads
  consistently across the UI.
