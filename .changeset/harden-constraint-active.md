---
'@boostv/process-optimizer-frontend-core': patch
---

Make `selectIsConstraintActive` consistent with the constraint actually sent to
the optimizer. It now derives from `calculateConstraints` (resolved, enabled,
continuous dimensions) instead of counting the raw stored dimension names, so a
degenerate (zero-dimension) or unresolvable sum constraint is correctly treated
as inactive and can no longer desync the suggestion-count logic from the request.
