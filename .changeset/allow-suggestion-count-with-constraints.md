---
'@boostv/process-optimizer-frontend-core': minor
'@boostv/process-optimizer-frontend-ui': minor
---

Allow changing the suggested-experiment count for experiments with an active sum
constraint. The optimizer handles constrained multi-point asks (constant-liar /
`cl_min`) and the suggestions respect the constraint, so the previous cap to a
single suggestion is no longer needed.

- `selectCalculatedSuggestionCountFromExperiment` no longer forces the count to
  1 when a constraint is active (initialization still returns the deficit).
- Removed `selectIsConstraintActive`'s only remaining consumers; the
  `selectIsSuggestionCountEditable` selector (its sole purpose was the constraint
  lock) is removed.
- `NextExperiments` no longer disables the count field or shows the
  "cannot be edited while there is a sum constraint" tooltip.
