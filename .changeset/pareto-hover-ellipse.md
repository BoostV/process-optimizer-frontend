---
'@boostv/process-optimizer-frontend-plots': minor
'@boostv/process-optimizer-frontend-ui': minor
---

Pareto front plot: make the uncertainty band the persistent view and show the 95% confidence ellipse for the front point under the cursor. Remove the visualization-mode toggle — the `paretoVisualizationModes` const, the `ParetoVisualizationMode` type, and the `visualizationMode` / `visualizationModeSelector` props are gone. Add an opt-in `showHoverEllipse` prop on `ParetoFrontPlot` (default off), surfaced as `showParetoHoverEllipse` on the multi-objective `Result`.
