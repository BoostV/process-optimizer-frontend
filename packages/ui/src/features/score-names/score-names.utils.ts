import {
  ScoreName,
  scoreDefaults,
  scoreNames,
} from '@boostv/process-optimizer-frontend-core'

// One editable score: its fixed internal name, the user-facing label, and
// whether higher (maximize) or lower values are better.
export type ScoreNameRow = { name: ScoreName; label: string; maximize: boolean }

export type ScoreNameError = 'empty' | 'duplicate'

// The scores of a new project: quality (maximized), plus cost (minimized) for
// multi objective.
export const defaultScoreNameRows = (multiObjective: boolean): ScoreNameRow[] =>
  scoreNames
    .slice(0, multiObjective ? 2 : 1)
    .map(name => ({ name, ...scoreDefaults[name] }))

// A label must be non-empty and unique (ignoring case and surrounding spaces).
export const validateScoreNames = (
  rows: ScoreNameRow[]
): { valid: boolean; errors: Partial<Record<ScoreName, ScoreNameError>> } => {
  const normalized = rows.map(row => row.label.trim().toLowerCase())
  const errors: Partial<Record<ScoreName, ScoreNameError>> = {}
  rows.forEach((row, i) => {
    if (normalized[i] === '') {
      errors[row.name] = 'empty'
    } else if (normalized.filter(label => label === normalized[i]).length > 1) {
      errors[row.name] = 'duplicate'
    }
  })
  return { valid: Object.keys(errors).length === 0, errors }
}
