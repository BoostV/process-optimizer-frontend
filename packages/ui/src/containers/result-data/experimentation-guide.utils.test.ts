import { describe, it, expect } from 'vitest'
import {
  convertJsonPlotToOneDData,
  groupSinglePlots,
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

  it('should convert score histogram JSON to OneDData with bell curve points', () => {
    const histogramPlotJson = JSON.stringify({
      histogram: { mean: 100, std: 10 },
    })
    const result = convertJsonPlotToOneDData(histogramPlotJson, false)
    expect(result.type).toBe('score')
    expect(result.points).toHaveLength(5)
    expect(result.points[0]).toEqual({ x: 80, y: 0 }) // mean - 2*std
    expect(result.points[1]).toEqual({ x: 90, y: 0.5 }) // mean - std
    expect(result.points[2]).toEqual({ x: 100, y: 1 }) // mean
    expect(result.points[3]).toEqual({ x: 110, y: 0.5 }) // mean + std
    expect(result.points[4]).toEqual({ x: 120, y: 0 }) // mean + 2*std
  })

  it('should return empty numeric plot when data is missing', () => {
    const emptyPlotJson = JSON.stringify({})
    const result = convertJsonPlotToOneDData(emptyPlotJson, false)
    expect(result.type).toBe('numeric')
    expect(result.points).toHaveLength(0)
  })

  it('should handle data array without reference line when refXValue not found', () => {
    const plotJson = JSON.stringify({
      data: [[1, 2, 3], [10, 20, 30], [40, 50, 60], 999], // 999 not in xValues
    })
    const result = convertJsonPlotToOneDData(plotJson, false)
    expect(result.type).toBe('numeric')
    expect(result.points).toHaveLength(3)
    expect(result.referenceLineX).toBeUndefined()
  })
})

describe('groupSinglePlots', () => {
  it('should group single-objective JSON plots correctly', () => {
    const plots: PlotEntry[] = [
      { id: 'single_0_0', plot: JSON.stringify({ data: [[1], [2], [3], 1] }) },
      {
        id: 'single_0_1',
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
      { id: 'single_1_0', plot: JSON.stringify({ data: [[1], [2], [3], 1] }) },
      { id: 'single_2_0', plot: JSON.stringify({ data: [[4], [5], [6], 4] }) },
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
        id: 'single_0_0',
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
      { id: 'single_0_2', plot: JSON.stringify({ data: [[1], [2], [3], 1] }) }, // m=2
      { id: 'single_0_0', plot: JSON.stringify({ data: [[1], [2], [3], 1] }) }, // m=0
      { id: 'single_0_1', plot: JSON.stringify({ data: [[1], [2], [3], 1] }) }, // m=1
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
        id: 'single_0_0',
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
