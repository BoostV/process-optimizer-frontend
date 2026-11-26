import { describe, expect, it } from 'vitest'
import { displayScore, displayScoreCI, scoreDisplayName } from './direction'

describe('displayScore', () => {
  it('flips the sign of a maximized score (stored negated by the optimizer)', () => {
    expect(displayScore(-2.5, true)).toBe(2.5)
  })
  it('leaves a minimized score as-is', () => {
    expect(displayScore(2.5, false)).toBe(2.5)
  })
})

describe('displayScoreCI', () => {
  it('formats the 95% interval of a maximized score in display units', () => {
    expect(displayScoreCI(-2, 0.5, true)).toBe('[1.02 to 2.98]')
  })
  it('formats the 95% interval of a minimized score', () => {
    expect(displayScoreCI(2, 0.5, false)).toBe('[1.02 to 2.98]')
  })
  it('is empty without a value or a spread', () => {
    expect(displayScoreCI(0, 0.5, true)).toBe('')
    expect(displayScoreCI(2, 0, false)).toBe('')
  })
})

describe('scoreDisplayName', () => {
  it('uses the short generic name while the label is the default', () => {
    expect(scoreDisplayName({ name: 'quality', label: 'Quality (0-5)' })).toBe(
      'Quality'
    )
    expect(scoreDisplayName({ name: 'cost', label: 'Cost' })).toBe('Cost')
  })
  it("uses the user's label once it is changed", () => {
    expect(scoreDisplayName({ name: 'quality', label: 'Yield' })).toBe('Yield')
  })
})
