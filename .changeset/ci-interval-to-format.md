---
'@boostv/process-optimizer-frontend-core': patch
'@boostv/process-optimizer-frontend-plots': patch
---

Format 95% credible intervals as [lower to upper] instead of [lower, upper], matching the 1D plots' hover format. Applies to the pareto front hover label and the credible-interval column under the plots (the plots package inlines these helpers and is republished to pick up the change).
