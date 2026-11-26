import { displayScore, displayScoreCI } from './direction'

// Fixed-direction shorthands from before score direction was configurable
// (quality maximized, cost minimized). Prefer displayScore / displayScoreCI
// with the score variable's own `maximize` flag.
export const displayQuality = (q: number): number => displayScore(q, true)

export const displayQualityCI = (value: number, stdDev: number): string =>
  displayScoreCI(value, stdDev, true)

export const displayCostCI = (value: number, stdDev: number): string =>
  displayScoreCI(value, stdDev, false)
