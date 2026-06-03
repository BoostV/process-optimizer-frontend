// Quality is stored negated (the optimizer minimizes), but shown positive.
// Centralizes the negation that was previously inlined across plots/ui.
export const displayQuality = (q: number): number => -q

export const displayQualityCI = (value: number, stdDev: number): string => {
  if (!value || !stdDev) {
    return ''
  }
  const lower = -value - 1.96 * stdDev
  const upper = -value + 1.96 * stdDev
  return `[${lower.toFixed(2)}, ${upper.toFixed(2)}]`
}

// Cost is stored as-is (not negated), so its 95% CI is value ± 1.96·σ with no
// sign flip. Mirrors displayQualityCI for the cost objective.
export const displayCostCI = (value: number, stdDev: number): string => {
  if (!value || !stdDev) {
    return ''
  }
  const lower = value - 1.96 * stdDev
  const upper = value + 1.96 * stdDev
  return `[${lower.toFixed(2)}, ${upper.toFixed(2)}]`
}
