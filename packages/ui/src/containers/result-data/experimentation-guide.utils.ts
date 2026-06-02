import { displayQuality } from '@boostv/process-optimizer-frontend-core'
import { OneDData } from '@boostv/process-optimizer-frontend-plots'

export type PlotEntry = { id: string; plot: string }
export type ActiveVariable = { type: string; options?: string[] }

// A plot payload is either structured json (starts with '{') or a base64 PNG.
// Parse defensively so a png plot (e.g. a classic-mode pareto plot) never throws
// and crashes the results render. Returns null for png / missing / malformed.
export const parsePlotJson = (plot: string | undefined): unknown => {
  if (!plot || !plot.trimStart().startsWith('{')) {
    return null
  }
  try {
    return JSON.parse(plot)
  } catch {
    return null
  }
}

// The optimizer minimizes -quality, so the json "quality" plots come back
// negated: the per-factor band (y) and the histogram value (x). Flip them to
// display units — the same transform the pareto plot applies via displayQuality.
// Only call this for the quality objective; minimize objectives (e.g. cost) are
// sent as-is and must not be flipped.
export const flipQualityScores = (data: OneDData): OneDData => {
  if (data.type === 'score') {
    // Histogram: x holds the (negated) quality value.
    return {
      ...data,
      points: data.points.map(p => ({
        ...p,
        x: typeof p.x === 'number' ? displayQuality(p.x) : p.x,
      })),
    }
  }
  // Per-factor plot: y holds the (negated) quality band [low, high]. Negating
  // swaps the bounds, so re-order to keep [low, high].
  return {
    ...data,
    points: data.points.map(p => ({
      ...p,
      y: Array.isArray(p.y)
        ? ([displayQuality(p.y[1] ?? 0), displayQuality(p.y[0] ?? 0)] as [
            number,
            number,
          ])
        : displayQuality(p.y),
    })),
  }
}

// The quality plots in a single-objective group all measure the same quantity
// (predicted quality), so the per-factor Y axes and the histogram X axis should
// share one scale — the way the server-rendered PNG pins them all to e.g. 0-6.
// Derive that scale from the (already flipped) plots: take the largest value
// across every band bound and histogram point, round up, and keep a 0-5 floor.
export const qualityDisplayDomain = (
  plots: (string | OneDData)[]
): [number, number] => {
  const values = plots.flatMap(p => {
    if (typeof p === 'string') {
      return []
    }
    if (p.type === 'score') {
      return p.points.map(pt => (typeof pt.x === 'number' ? pt.x : NaN))
    }
    return p.points.flatMap(pt => (Array.isArray(pt.y) ? pt.y : [pt.y]))
  })
  const finite = values.filter(n => Number.isFinite(n))
  const max = finite.length > 0 ? Math.max(...finite) : 5
  return [0, Math.max(5, Math.ceil(max))]
}

export const convertJsonPlotToOneDData = (
  plotJson: string,
  isOptionsVariable: boolean
): OneDData => {
  const parsed = JSON.parse(plotJson) as Record<string, unknown>

  if ('histogram' in parsed) {
    const histogram = parsed['histogram'] as { mean: number; std: number }
    const { mean, std } = histogram
    // The backend only sends the predicted-score distribution as mean+std, so
    // draw the normal curve ourselves. Sampling it at just a few points reads
    // as a jagged spike; sample densely over ±3σ (~99.7% of the mass) for a
    // smooth bell. Peak-normalized to 1 so the shape — not the absolute density
    // — is what's shown, matching the per-factor bands' y-scale.
    if (!(std > 0)) {
      // Degenerate distribution (zero/invalid spread): a single point at mean.
      return { type: 'score', points: [{ x: mean, y: 1 }] }
    }
    const SAMPLES = 101
    const SIGMA_SPAN = 3
    const points = Array.from({ length: SAMPLES }, (_, i) => {
      const z = -SIGMA_SPAN + (2 * SIGMA_SPAN * i) / (SAMPLES - 1)
      return { x: mean + z * std, y: Math.exp(-0.5 * z * z) }
    })
    return { type: 'score', points }
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
  // The backend emits per-objective single plots under either an
  // `objective_<n>_<m>` or a `single_<n>_<m>` prefix (the latter is also used
  // by saved experiments such as the catapult sample). Match both so their
  // plots aren't silently dropped from the "Predicted best solution" panel.
  const regex = /^(?:objective|single)_(\d+)_(\d+)$/
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
