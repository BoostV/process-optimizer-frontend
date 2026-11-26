import { describe, expect, it } from 'vitest'
import { OneDData } from '@boostv/process-optimizer-frontend-plots'
import { objectivePlotData, selectedPointCI } from './result.utils'
import {
  flipQualityScores,
  flipScores,
} from '../../containers/result-data/experimentation-guide.utils'

// Optimizer-unit plots for one objective: a per-factor band and a histogram.
const band: OneDData = {
  type: 'numeric',
  points: [
    { x: 0, y: [-3, -1] },
    { x: 1, y: [-4, -2] },
  ],
}
const histogram: OneDData = { type: 'score', points: [{ x: -2, y: 1 }] }

describe('flipScores', () => {
  it('is the same transform as the former flipQualityScores', () => {
    expect(flipScores(band)).toEqual(flipQualityScores(band))
    expect(flipScores(histogram)).toEqual(flipQualityScores(histogram))
    expect(flipScores(band).points[0]?.y).toEqual([1, 3])
    expect(flipScores(histogram).points[0]?.x).toBe(2)
  })
})

describe('objectivePlotData', () => {
  it('default quality: flipped to display units, quality scale and colour', () => {
    const [b, h] = objectivePlotData([band, histogram], {
      name: 'quality',
      maximize: true,
    }) as OneDData[]
    expect(b?.points[0]?.y).toEqual([1, 3])
    expect(b).toMatchObject({ objective: 'quality', yDomain: [0, 5] })
    expect(h?.points[0]?.x).toBe(2)
    expect(h).toMatchObject({ objective: 'quality', xDomain: [0, 5] })
  })

  it('default cost: not flipped, cost scale and colour', () => {
    const costBand: OneDData = {
      type: 'numeric',
      points: [{ x: 0, y: [2, 7] }],
    }
    const [b] = objectivePlotData([costBand], {
      name: 'cost',
      maximize: false,
    }) as OneDData[]
    expect(b?.points[0]?.y).toEqual([2, 7])
    expect(b).toMatchObject({ objective: 'cost', yDomain: [0, 7] })
  })

  it('a minimized first score is not flipped', () => {
    const raw: OneDData = { type: 'numeric', points: [{ x: 0, y: [1, 3] }] }
    const [b] = objectivePlotData([raw], {
      name: 'quality',
      maximize: false,
    }) as OneDData[]
    expect(b?.points[0]?.y).toEqual([1, 3])
    expect(b?.objective).toBe('quality')
  })

  it('a maximized second score is flipped', () => {
    const [b] = objectivePlotData([band], {
      name: 'cost',
      maximize: true,
    }) as OneDData[]
    expect(b?.points[0]?.y).toEqual([1, 3])
    expect(b?.objective).toBe('cost')
  })

  it('leaves png plots and unknown objectives untouched', () => {
    expect(objectivePlotData(['png', band], undefined)).toEqual(['png', band])
    expect(
      objectivePlotData(['png'], { name: 'quality', maximize: true })
    ).toEqual(['png'])
  })
})

describe('selectedPointCI', () => {
  const pareto = {
    front_y_data: [[-2, 4]] as [number, number][],
    obj1_error: [0.5],
    obj2_error: [1],
  }
  it('defaults: first score flipped, second as-is (as before)', () => {
    expect(selectedPointCI(0, true, pareto, 0)).toBe('[1.02 to 2.98]')
    expect(selectedPointCI(1, false, pareto, 0)).toBe('[2.04 to 5.96]')
  })
  it('follows the direction of each score', () => {
    expect(selectedPointCI(0, false, pareto, 0)).toBe('[-2.98 to -1.02]')
    expect(selectedPointCI(1, true, pareto, 0)).toBe('[-5.96 to -2.04]')
  })
})
