import { OneDData } from '@boostv/process-optimizer-frontend-plots'

export type PlotEntry = { id: string; plot: string }
export type ActiveVariable = { type: string; options?: string[] }

export const convertJsonPlotToOneDData = (
  plotJson: string,
  isOptionsVariable: boolean
): OneDData => {
  const parsed = JSON.parse(plotJson) as Record<string, unknown>

  if ('histogram' in parsed) {
    const histogram = parsed['histogram'] as { mean: number; std: number }
    const { mean, std } = histogram
    return {
      type: 'score',
      points: [
        { x: mean - 2 * std, y: 0 },
        { x: mean - std, y: 0.5 },
        { x: mean, y: 1 },
        { x: mean + std, y: 0.5 },
        { x: mean + 2 * std, y: 0 },
      ],
    }
  }

  if ('data' in parsed) {
    const data = parsed['data'] as [number[], number[], number[], number]
    const [xValues, yLow, yHigh, refXValue] = data
    const points = xValues.map((x, i) => ({
      x,
      y: [yLow[i] as number, yHigh[i] as number] as [number, number],
    }))
    const refIndex =
      xValues.length > 0
        ? xValues.reduce(
            (closest, x, i) =>
              Math.abs(x - refXValue) < Math.abs(xValues[closest]! - refXValue)
                ? i
                : closest,
            0
          )
        : -1
    const referenceLineX = refIndex >= 0 ? refIndex : undefined
    return {
      type: isOptionsVariable ? 'options' : 'numeric',
      points,
      ...(referenceLineX !== undefined ? { referenceLineX } : {}),
    }
  }

  return { type: 'numeric', points: [] }
}

export const groupSinglePlots = (
  plots: PlotEntry[],
  activeVariables: ActiveVariable[]
): (string | OneDData)[][] => {
  const regex = /^single_(\d+)_(\d+)$/
  const grouped = new Map<
    number,
    Array<{ m: number; data: string | OneDData }>
  >()

  for (const { id, plot } of plots) {
    const match = regex.exec(id)
    if (!match) continue
    const n = parseInt(match[1] as string, 10)
    const m = parseInt(match[2] as string, 10)
    if (!grouped.has(n)) grouped.set(n, [])

    const isOptions = activeVariables[m]?.type === 'options'
    const isJsonPlot = plot.trimStart().startsWith('{')
    const data: string | OneDData = isJsonPlot
      ? convertJsonPlotToOneDData(plot, isOptions)
      : plot
    grouped.get(n)!.push({ m, data })
  }

  if (grouped.size === 0) return []

  const sortedKeys = Array.from(grouped.keys()).sort((a, b) => a - b)
  return sortedKeys.map(n => {
    const entries = grouped.get(n)!
    entries.sort((a, b) => a.m - b.m)
    return entries.map(e => e.data)
  })
}
