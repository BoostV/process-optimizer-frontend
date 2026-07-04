---
'@boostv/process-optimizer-frontend-core': patch
---

Keep the pareto front selection when an unscored data point is added. Transferring a pareto point ("Add as data point") or a suggestion to the data table appends a valid:false row that is excluded from the optimizer request and cannot move the front — it no longer clears the selection or triggers a re-evaluation. Rows becoming active (score entered), removals, and variable/config changes still invalidate the selection.
