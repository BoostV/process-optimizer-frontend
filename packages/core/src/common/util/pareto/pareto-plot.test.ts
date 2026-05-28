import { describe, expect, it } from 'vitest'
import { parseParetoPlot, costDomain } from './pareto-plot'

const REAL = {
  front_x_data: [
    [58.2, 21.4, 85, 6, 'Frosting'],
    [16.7, 500, 250, 20, 'None'],
  ],
  front_y_data: [
    [-6, -25],
    [-2, -17],
  ],
  obj1_error: [0.015, 0.02],
  obj2_error: [0.18, 0.2],
  best_idx: 1,
}

describe('parseParetoPlot', () => {
  it('parses a real backend pareto_data payload', () => {
    const p = parseParetoPlot(REAL)
    expect(p).not.toBeNull()
    expect(p!.best_idx).toBe(1)
    expect(p!.front_y_data).toHaveLength(2)
    expect(p!.obj1_error[0]).toBe(0.015)
  })

  it('returns null for an empty object', () => {
    expect(parseParetoPlot({})).toBeNull()
  })

  it('returns null for non-pareto JSON', () => {
    expect(parseParetoPlot({ data: [1, 2, 3] })).toBeNull()
  })
})

describe('costDomain', () => {
  it('spans min/max cost ± obj2 error', () => {
    const d = costDomain(parseParetoPlot(REAL)!)
    expect(d).not.toBeUndefined()
    expect(d![0]).toBeLessThan(-24)
    expect(d![1]).toBeGreaterThan(-16)
  })
})
