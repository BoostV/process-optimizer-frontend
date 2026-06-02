---
'@boostv/process-optimizer-frontend-ui': patch
---

Multi-objective results: render the predicted-score (quality/cost) histograms as
a smooth curve. The backend sends only the distribution's mean and std, and we
were drawing it as 5 hardcoded points over ±2σ, which looked like a jagged
triangular spike. Now sample the normal curve densely (101 points over ±3σ,
peak-normalized to 1), giving the smooth bell the distribution actually
describes.
