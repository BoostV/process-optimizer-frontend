import {
  ScoreName,
  scoreDefaults,
  scoreNames,
} from '@boostv/process-optimizer-frontend-core'

// One editable score: its fixed internal name, the user-facing label, and
// whether higher (maximize) or lower values are better.
export type ScoreNameRow = { name: ScoreName; label: string; maximize: boolean }

export type ScoreNameError = 'empty' | 'duplicate' | 'reserved'

// The scores of a new project: quality (maximized), plus cost (minimized) for
// multi objective.
export const defaultScoreNameRows = (multiObjective: boolean): ScoreNameRow[] =>
  scoreNames
    .slice(0, multiObjective ? 2 : 1)
    .map(name => ({ name, ...scoreDefaults[name] }))

// A label must be non-empty, unique, and not one of the reserved names (the
// factor names: scores share the data table and the CSV columns with them).
// Comparison ignores case and surrounding spaces.
export const validateScoreNames = (
  rows: ScoreNameRow[],
  reservedNames: string[] = []
): { valid: boolean; errors: Partial<Record<ScoreName, ScoreNameError>> } => {
  const normalized = rows.map(row => row.label.trim().toLowerCase())
  const reserved = reservedNames.map(name => name.trim().toLowerCase())
  const errors: Partial<Record<ScoreName, ScoreNameError>> = {}
  rows.forEach((row, i) => {
    if (normalized[i] === '') {
      errors[row.name] = 'empty'
    } else if (normalized.filter(label => label === normalized[i]).length > 1) {
      errors[row.name] = 'duplicate'
    } else if (reserved.includes(normalized[i] ?? '')) {
      errors[row.name] = 'reserved'
    }
  })
  return { valid: Object.keys(errors).length === 0, errors }
}
