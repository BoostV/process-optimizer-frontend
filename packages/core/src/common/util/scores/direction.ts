import { ScoreName, scoreDefaults } from '@core/common/types'

// The optimizer always minimizes. A maximized score is therefore sent negated
// and comes back negated; a minimized score is sent and returned as-is.
// These helpers convert optimizer units back to what the user entered.
export const displayScore = (value: number, maximize: boolean): number =>
  maximize ? -value : value

// 95% interval (value ± 1.96·σ) in display units. Empty when there is no
// value or no spread to show.
export const displayScoreCI = (
  value: number,
  stdDev: number,
  maximize: boolean
): string => {
  if (!value || !stdDev) {
    return ''
  }
  const center = displayScore(value, maximize)
  const lower = center - 1.96 * stdDev
  const upper = center + 1.96 * stdDev
  return `[${lower.toFixed(2)} to ${upper.toFixed(2)}]`
}

// Short name for plots and result rows: the generic name while the label is
// still the default ('Quality (0-5)' → 'Quality'), otherwise the user's label.
export const scoreDisplayName = (sv: {
  name: ScoreName
  label: string
}): string =>
  sv.label === scoreDefaults[sv.name].label
    ? sv.name.charAt(0).toUpperCase() + sv.name.slice(1)
    : sv.label
