---
'@boostv/process-optimizer-frontend-plots': patch
---

1D band plots: make the hover tooltip clearer. The top line now prefixes the
x value with `x: `, and the value is shown as an explicit credible-interval
range `[low to high]` instead of a bare comma-separated pair. Histograms are
unaffected (they have no tooltip).
