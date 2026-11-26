---
'@boostv/process-optimizer-frontend-core': minor
'@boostv/process-optimizer-frontend-plots': minor
'@boostv/process-optimizer-frontend-ui': minor
---

Score variables can be renamed and set to maximize or minimize.

- core: experiment format v23 adds `maximize` to each score variable (migration
  keeps today's behaviour: quality maximized, cost minimized). New
  `updateScoreVariables` action, `selectActiveScoreVariables` selector and
  direction-aware helpers `displayScore`, `displayScoreCI`, `scoreDisplayName`.
  Scores are negated for the optimizer by direction instead of by name.
- plots: `ParetoFrontPlot` takes an optional `objectives` prop with the name and
  direction of both axes.
- ui: new `ScoreNames` component (read-only view with Edit, editing with
  Save and Cancel, and a bare variant for forms); results follow each score's direction and name.
- core: CSV export heads score columns with the score labels
  (`dataPointsToCSV` takes the score variables; new `scoreCsvHeaders`); import
  accepts the label or the internal name.
- ui: `ScoreNames` and `InputModel` take `reservedNames` so a score and a factor
  cannot share a name; the first score is entered as a plain number instead of
  a star rating when it is minimized.
