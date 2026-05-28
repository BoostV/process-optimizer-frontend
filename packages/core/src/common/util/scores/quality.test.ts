import { describe, expect, it } from 'vitest'
import { displayQuality, displayQualityCI } from './quality'

describe('displayQuality', () => {
  it('negates a stored quality value for display', () => {
    expect(displayQuality(-2.5)).toBe(2.5)
    expect(displayQuality(3)).toBe(-3)
  })
})

describe('displayQualityCI', () => {
  it('returns a 95% CI string from a negated value and std dev', () => {
    expect(displayQualityCI(-2, 0.5)).toBe('[1.02, 2.98]')
  })

  it('returns an empty string when value or stdDev is missing/zero', () => {
    expect(displayQualityCI(0, 0.5)).toBe('')
    expect(displayQualityCI(-2, 0)).toBe('')
  })
})
