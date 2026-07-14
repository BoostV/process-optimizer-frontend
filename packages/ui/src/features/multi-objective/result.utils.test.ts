import { describe, expect, it } from 'vitest'
import { matchFrontIndex, resolveSelectedIndex } from './result.utils'

describe('matchFrontIndex', () => {
  const front: Array<Array<number | string>> = [
    [100, 'Vanilla'],
    [120, 'Chocolate'],
    [150, 'Whipped cream'],
  ]

  it('returns the index of an exact match', () => {
    expect(matchFrontIndex(front, [120, 'Chocolate'])).toBe(1)
  })

  it('returns -1 when no row matches', () => {
    expect(matchFrontIndex(front, [999, 'Chocolate'])).toBe(-1)
  })

  it('returns -1 when lengths differ', () => {
    expect(matchFrontIndex(front, [120])).toBe(-1)
  })

  it('returns -1 when types differ at a position', () => {
    expect(matchFrontIndex(front, ['120', 'Chocolate'])).toBe(-1)
  })

  it('returns -1 for an empty front', () => {
    expect(matchFrontIndex([], [120, 'Chocolate'])).toBe(-1)
  })
})

describe('resolveSelectedIndex', () => {
  const front: Array<Array<number | string>> = [
    [100, 'Vanilla'],
    [120, 'Chocolate'],
  ]

  it('returns the matched front index when coords are present', () => {
    expect(resolveSelectedIndex(front, [120, 'Chocolate'], 0)).toBe(1)
  })

  it('falls back to bestIdx when coords are undefined', () => {
    expect(resolveSelectedIndex(front, undefined, 0)).toBe(0)
  })

  it('falls back to bestIdx when coords do not match', () => {
    expect(resolveSelectedIndex(front, [999, 'X'], 1)).toBe(1)
  })
})
