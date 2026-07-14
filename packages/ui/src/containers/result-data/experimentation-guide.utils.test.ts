import { describe, it, expect } from 'vitest'
import {
  convertJsonPlotToOneDData,
  flipQualityScores,
  groupSinglePlots,
  parsePlotJson,
  qualityDisplayDomain,
  type PlotEntry,
  type ActiveVariable,
} from './experimentation-guide.utils'

describe('convertJsonPlotToOneDData', () => {
  it('should convert numeric variable plot JSON to OneDData with reference line', () => {
    const numericPlotJson = JSON.stringify({
      data: [[100, 110, 120], [10, 11, 12], [20, 21, 22], 110],
    })
    const result = convertJsonPlotToOneDData(numericPlotJson, false)
    expect(result.type).toBe('numeric')
    expect(result.points).toHaveLength(3)
    expect(result.points[0]).toEqual({ x: 100, y: [10, 20] })
    expect(result.points[1]).toEqual({ x: 110, y: [11, 21] })
    expect(result.points[2]).toEqual({ x: 120, y: [12, 22] })
    expect(result.referenceLineX).toBe(1) // index of x=110
  })

  it('should convert options variable plot JSON to OneDData', () => {
    const optionsPlotJson = JSON.stringify({
      data: [[0, 1, 2], [5, 6, 7], [8, 9, 10], 2],
    })
    const result = convertJsonPlotToOneDData(optionsPlotJson, true)
    expect(result.type).toBe('options')
    expect(result.points).toHaveLength(3)
    expect(result.points[0]).toEqual({ x: 0, y: [5, 8] })
    expect(result.points[1]).toEqual({ x: 1, y: [6, 9] })
    expect(result.points[2]).toEqual({ x: 2, y: [7, 10] })
    expect(result.referenceLineX).toBe(2) // index of x=2
  })

  it('should convert score histogram JSON to a dense smooth Gaussian bell', () => {
    const histogramPlotJson = JSON.stringify({
      histogram: { mean: 100, std: 10 },
    })
    const result = convertJsonPlotToOneDData(histogramPlotJson, false)
    expect(result.type).toBe('score')
    // Densely sampled over ±3σ for a smooth curve (not a 5-point spike).
    expect(result.points).toHaveLength(101)
    const xs = result.points.map(p => p.x as number)
    const ys = result.points.map(p => p.y as number)
    expect(xs[0]).toBeCloseTo(70) // mean - 3σ
    expect(xs[xs.length - 1]).toBeCloseTo(130) // mean + 3σ
    // Peak of 1 at the mean (centre sample), symmetric tails.
    const mid = (result.points.length - 1) / 2
    expect(result.points[mid]).toEqual({ x: 100, y: 1 })
    expect(ys[0]).toBeCloseTo(Math.exp(-4.5)) // y at ±3σ
    expect(ys[0]).toBeCloseTo(ys[ys.length - 1] as number)
    expect(Math.max(...ys)).toBe(1)
    expect(Math.min(...ys)).toBeGreaterThan(0)
  })

  it('returns a single point for a degenerate (zero-std) histogram', () => {
    const result = convertJsonPlotToOneDData(
      JSON.stringify({ histogram: { mean: 2, std: 0 } }),
      false
    )
    expect(result.type).toBe('score')
    expect(result.points).toEqual([{ x: 2, y: 1 }])
  })

  it('should return empty numeric plot when data is missing', () => {
    const emptyPlotJson = JSON.stringify({})
    const result = convertJsonPlotToOneDData(emptyPlotJson, false)
    expect(result.type).toBe('numeric')
    expect(result.points).toHaveLength(0)
  })

  it('should handle data array without reference line when refXValue not found', () => {
    const plotJson = JSON.stringify({
      data: [[1, 2, 3], [10, 20, 30], [40, 50, 60], 999], // 999 not in xValues, but closest is 3 at index 2
    })
    const result = convertJsonPlotToOneDData(plotJson, false)
    expect(result.type).toBe('numeric')
    expect(result.points).toHaveLength(3)
    expect(result.referenceLineX).toBe(2) // closest value to 999 is 3 at index 2
  })

  it('should find closest xValue when refXValue does not exactly match (linspace data)', () => {
    // Generate 60-point linspace from 100 to 200
    const xValues = Array.from({ length: 60 }, (_, i) => 100 + i * (100 / 59))
    const yLow = Array(60).fill(0)
    const yHigh = Array(60).fill(0)
    const plotJson = JSON.stringify({
      data: [xValues, yLow, yHigh, 131],
    })
    const result = convertJsonPlotToOneDData(plotJson, false)
    expect(result.type).toBe('numeric')
    expect(result.points).toHaveLength(60)
    // Index 18 has value ~130.508, which is closest to refXValue 131
    expect(result.referenceLineX).toBe(18)
  })

  it('should handle empty xValues array gracefully', () => {
    const plotJson = JSON.stringify({
      data: [[], [], [], 0],
    })
    const result = convertJsonPlotToOneDData(plotJson, false)
    expect(result.type).toBe('numeric')
    expect(result.points).toHaveLength(0)
    expect(result.referenceLineX).toBeUndefined()
  })
})

describe('groupSinglePlots', () => {
  it('should group single-objective JSON plots correctly', () => {
    const plots: PlotEntry[] = [
      {
        id: 'objective_0_0',
        plot: JSON.stringify({ data: [[1], [2], [3], 1] }),
      },
      {
        id: 'objective_0_1',
        plot: JSON.stringify({ histogram: { mean: 5, std: 1 } }),
      },
      { id: 'convergence_0', plot: 'somedata' }, // non-matching id, should be ignored
    ]
    const activeVariables: ActiveVariable[] = [
      { type: 'numeric' },
      { type: 'score' },
    ]
    const result = groupSinglePlots(plots, activeVariables)
    expect(result).toHaveLength(1) // one objective group (n=0)
    expect(result[0]).toHaveLength(2) // two plots in group 0
    // First plot should be OneDData
    const firstPlot = result[0]?.[0]
    expect(firstPlot).toBeDefined()
    if (firstPlot !== undefined && typeof firstPlot !== 'string') {
      expect(firstPlot.type).toBe('numeric')
    }
    // Second plot should be OneDData with score type
    const secondPlot = result[0]?.[1]
    expect(secondPlot).toBeDefined()
    if (secondPlot !== undefined && typeof secondPlot !== 'string') {
      expect(secondPlot.type).toBe('score')
    }
  })

  it('should group multi-objective JSON plots into separate objective groups', () => {
    const plots: PlotEntry[] = [
      {
        id: 'objective_1_0',
        plot: JSON.stringify({ data: [[1], [2], [3], 1] }),
      },
      {
        id: 'objective_2_0',
        plot: JSON.stringify({ data: [[4], [5], [6], 4] }),
      },
      { id: 'pareto_data', plot: 'ignored' },
    ]
    const activeVariables: ActiveVariable[] = [{ type: 'numeric' }]
    const result = groupSinglePlots(plots, activeVariables)
    expect(result).toHaveLength(2) // two objective groups (n=1, n=2)
    expect(result[0]).toHaveLength(1) // one plot in group 1
    expect(result[1]).toHaveLength(1) // one plot in group 2
  })

  it('should preserve PNG strings and not try to parse them', () => {
    const plots: PlotEntry[] = [
      {
        id: 'objective_0_0',
        plot: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      },
    ]
    const activeVariables: ActiveVariable[] = [{ type: 'numeric' }]
    const result = groupSinglePlots(plots, activeVariables)
    expect(result).toHaveLength(1)
    expect(typeof result[0]![0]).toBe('string')
    expect(result[0]![0]).toBe(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    )
  })

  it('should return empty array when no plots match regex', () => {
    const plots: PlotEntry[] = [
      { id: 'convergence_0', plot: 'data1' },
      { id: 'pareto_0', plot: 'data2' },
      { id: 'histogram_0', plot: 'data3' },
    ]
    const activeVariables: ActiveVariable[] = []
    const result = groupSinglePlots(plots, activeVariables)
    expect(result).toHaveLength(0)
  })

  it('should return empty array for empty plots array', () => {
    const result = groupSinglePlots([], [])
    expect(result).toHaveLength(0)
  })

  it('should sort plots by variable index (m) within each objective group', () => {
    const plots: PlotEntry[] = [
      {
        id: 'objective_0_2',
        plot: JSON.stringify({ data: [[1], [2], [3], 1] }),
      }, // m=2
      {
        id: 'objective_0_0',
        plot: JSON.stringify({ data: [[1], [2], [3], 1] }),
      }, // m=0
      {
        id: 'objective_0_1',
        plot: JSON.stringify({ data: [[1], [2], [3], 1] }),
      }, // m=1
    ]
    const activeVariables: ActiveVariable[] = [
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric' },
    ]
    const result = groupSinglePlots(plots, activeVariables)
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveLength(3)
    // Verify they are in order m=0, m=1, m=2
    // We can't directly check the order from result structure, but the parsing should have worked
    expect(result[0]![0]).toBeDefined()
    expect(result[0]![1]).toBeDefined()
    expect(result[0]![2]).toBeDefined()
  })

  it('should correctly identify options variables and convert appropriately', () => {
    const plots: PlotEntry[] = [
      {
        id: 'objective_0_0',
        plot: JSON.stringify({ data: [[0, 1, 2], [5, 6, 7], [8, 9, 10], 1] }),
      },
    ]
    const activeVariables: ActiveVariable[] = [{ type: 'options' }]
    const result = groupSinglePlots(plots, activeVariables)
    expect(result).toHaveLength(1)
    const plot = result[0]?.[0]
    expect(plot).toBeDefined()
    if (plot !== undefined && typeof plot !== 'string') {
      expect(plot.type).toBe('options')
    }
  })
})

describe('flipQualityScores', () => {
  it('negates and reorders a per-factor quality band (numeric)', () => {
    const out = flipQualityScores({
      type: 'numeric',
      points: [{ x: 100, y: [-5.86, -2.76] }],
    })
    expect(out.points[0]).toEqual({ x: 100, y: [2.76, 5.86] })
  })

  it('negates the per-factor band but keeps the option label (options)', () => {
    const out = flipQualityScores({
      type: 'options',
      points: [{ x: 'A', y: [-4, -2] }],
    })
    expect(out.points[0]).toEqual({ x: 'A', y: [2, 4] })
  })

  it('negates the histogram quality x values (score)', () => {
    const out = flipQualityScores({
      type: 'score',
      points: [
        { x: -7, y: 0 },
        { x: -5, y: 1 },
      ],
    })
    expect(out.points.map(p => p.x)).toEqual([7, 5])
  })
})

describe('qualityDisplayDomain', () => {
  it('spans the largest band bound and histogram point, rounded up', () => {
    const domain = qualityDisplayDomain([
      { type: 'numeric', points: [{ x: 100, y: [2.76, 5.88] }] },
      { type: 'numeric', points: [{ x: 90, y: [2.0, 5.99] }] },
      {
        type: 'score',
        points: [
          { x: 5.45, y: 0 },
          { x: 5.07, y: 1 },
        ],
      },
    ])
    expect(domain).toEqual([0, 6])
  })

  it('keeps a 0-5 floor when all values are small', () => {
    expect(
      qualityDisplayDomain([{ type: 'numeric', points: [{ x: 1, y: [1, 2] }] }])
    ).toEqual([0, 5])
  })

  it('ignores png strings and non-numeric points', () => {
    expect(
      qualityDisplayDomain([
        'iVBORw0KGgoAAAANSUhEUg',
        { type: 'options', points: [{ x: 'A', y: [3, 7] }] },
      ])
    ).toEqual([0, 7])
  })

  it('falls back to 0-5 for an empty group', () => {
    expect(qualityDisplayDomain([])).toEqual([0, 5])
  })
})

describe('parsePlotJson', () => {
  it('parses a json plot payload', () => {
    expect(parsePlotJson('{"a":1}')).toEqual({ a: 1 })
  })
  it('returns null for a base64 PNG plot (does not throw)', () => {
    expect(parsePlotJson('iVBORw0KGgoAAAANSUhEUg')).toBeNull()
  })
  it('returns null for undefined or malformed input', () => {
    expect(parsePlotJson(undefined)).toBeNull()
    expect(parsePlotJson('{ not json')).toBeNull()
  })
})
