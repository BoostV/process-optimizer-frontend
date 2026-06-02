---
'@boostv/process-optimizer-frontend-core': patch
'@boostv/process-optimizer-frontend-ui': patch
---

Reset the suggestion count to its default when the model is first fit. While
initializing, the count is forced to `initialPoints`; once enough data points
are entered to fit the model it now drops back to 1 instead of "sticking" at the
initial value. The `Suggestions` input also follows the calculated count, so it
reflects the change rather than showing a stale value.
