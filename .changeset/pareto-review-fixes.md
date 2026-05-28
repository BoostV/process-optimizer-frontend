---
'@boostv/process-optimizer-frontend-plots': patch
'@boostv/process-optimizer-frontend-core': patch
'@boostv/process-optimizer-frontend-ui': patch
---

Refactor the Pareto plot per code review: decompose `pareto-front-plot.tsx` into focused overlay/projector/hover/label modules, rewrite the hover system on Recharts `usePlotArea` (removing the brittle internal-class `querySelector`), and replace the `cloneElement` button injection with a `renderControls` render prop. Centralize quality negation (`displayQuality`/`displayQualityCI`) and the typed Pareto-plot parser (`parseParetoPlot`/`costDomain`) in core, drive multi-objective score display off canonical score names, and replace the 11 per-reducer `clearParetoSelection` calls with a single selection-invalidation policy. Drop the `as unknown as ExperimentExtrasSelectedPointInner[]` cast via a proper `SelectedPoint` type, and replace the fabricated demo data with a real backend-captured sample.
