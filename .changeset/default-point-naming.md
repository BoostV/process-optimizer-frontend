---
'@boostv/process-optimizer-frontend-ui': patch
'@boostv/process-optimizer-frontend-plots': patch
---

Multi-objective results: rename the default Pareto selection from "optimal" to
"default". We don't know how the user weights quality vs cost, and the default
only assumes an equal (1:1) balance — so "optimal" was misleading. The header
chip now reads "Default point" (and "Selected point" once the user picks a point
on the Pareto front), the caption explains it as the model's default equal
balance, the reset controls say "default", and the Pareto hover tooltip reads
"Target — default point". The mathematical term "Pareto-optimal observation" is
unchanged.
