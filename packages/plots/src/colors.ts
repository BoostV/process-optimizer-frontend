import { useTheme } from '@mui/material/styles'

// All themeable plot colors. A consuming app can override any subset via the
// MUI theme (`palette.plots`); anything omitted falls back to the defaults
// below. Used across the Pareto front plot and the 1D / score plots so the
// whole result view can be restyled from one place.
export type PlotColors = {
  /** Quality objective tint — result row + Pareto quality uncertainty band. */
  quality: string
  /** Cost objective tint — result row + Pareto cost uncertainty band. */
  cost: string
  /** Fill of the 1D credible-interval band plots. */
  band: string
  /** Fill of the score / histogram plots. */
  score: string
  /** The point currently selected on the Pareto front (+ its crosshair). */
  selectedPoint: string
  /** Observed points that lie on the Pareto front. */
  paretoOptimal: string
  /** Observed points dominated by the front (marker outline). */
  dominated: string
  /** The Pareto front line. */
  front: string
}

export const defaultPlotColors: PlotColors = {
  quality: '#e2e8ec',
  cost: '#ede8e2',
  band: '#a3d764',
  score: '#76c7c0',
  selectedPoint: '#077ace',
  paretoOptimal: '#2b5879',
  dominated: '#999999',
  front: '#000000',
}

declare module '@mui/material/styles' {
  interface Palette {
    plots?: Partial<PlotColors>
  }
  interface PaletteOptions {
    plots?: Partial<PlotColors>
  }
}

/**
 * Plot colors resolved from the MUI theme (`palette.plots`), merged over the
 * defaults. Set `palette.plots` in your theme to restyle every plot surface.
 */
export const usePlotColors = (): PlotColors => {
  const { palette } = useTheme()
  return { ...defaultPlotColors, ...(palette.plots ?? {}) }
}
