import { describe, expect, it } from 'vitest'
import { matchFrontIndex } from './result.utils'

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
