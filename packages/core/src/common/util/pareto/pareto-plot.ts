import { z } from 'zod'

// Real backend pareto_data shape (verified against the live optimizer):
// errors are scalar numbers per front point, not tuples.
export const paretoPlotSchema = z.object({
  front_x_data: z.array(z.array(z.number().or(z.string()))),
  front_y_data: z.array(z.tuple([z.number(), z.number()])),
  obj1_error: z.array(z.number()),
  obj2_error: z.array(z.number()),
  best_idx: z.number(),
})

export type ParetoPlot = z.infer<typeof paretoPlotSchema>

// Parse an untyped, already-JSON-parsed value. Returns null when the value is
// not a valid pareto payload (empty object, single-objective response, etc.)
// so callers can render "no pareto" without try/catch.
export const parseParetoPlot = (raw: unknown): ParetoPlot | null => {
  const result = paretoPlotSchema.safeParse(raw)
  return result.success ? result.data : null
}

// Cost axis: [min, max] of front cost ± obj2 error. undefined when no front.
export const costDomain = (plot: ParetoPlot): [number, number] | undefined => {
  if (plot.front_y_data.length === 0) {
    return undefined
  }
  const lowers = plot.front_y_data.map(
    (yPair, i) => yPair[1] - (plot.obj2_error[i] ?? 0)
  )
  const uppers = plot.front_y_data.map(
    (yPair, i) => yPair[1] + (plot.obj2_error[i] ?? 0)
  )
  const all = [...lowers, ...uppers]
  return [Math.min(...all), Math.max(...all)]
}
