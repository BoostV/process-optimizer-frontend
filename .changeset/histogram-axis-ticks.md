---
'@boostv/process-optimizer-frontend-ui': patch
'@boostv/process-optimizer-frontend-plots': patch
---

Multi-objective results: give the quality/cost score histograms a consistent
x-axis. Recharts' default left only 2-3 sparse ticks (e.g. the quality
histogram showed just 2 and 5). Now draw a fixed set of 6 evenly-spaced ticks
spanning 0..max (both ends included), and anchor the cost histogram's domain at
0 (quality already started there) so both read 0 → max. A small axis inset keeps
the 0 and max labels from clipping at the chart edges.
