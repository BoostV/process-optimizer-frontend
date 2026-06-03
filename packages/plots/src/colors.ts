import { useTheme } from '@mui/material/styles'

// All themeable plot colors, grouped by the surface they style. A consuming app
// can override any subset via the MUI theme (`palette.plots`); anything omitted
// falls back to the defaults below. Each section is merged independently, so a
// partial override (e.g. only `pareto.costBand`) keeps the other defaults.
export type PlotColors = {
  /** Result-card row background tints — one block per objective. */
  row: {
    quality: string
    cost: string
  }
  /** The 1D per-factor and credible-interval plots in the result rows. */
  oneD: {
    /** Quality objective: fill of its 1D factor plots. */
    qualityBand: string
    /** Quality objective: fill of its credible-interval histogram. */
    qualityScore: string
    /** Cost objective: fill of its 1D factor plots. */
    costBand: string
    /** Cost objective: fill of its credible-interval histogram. */
    costScore: string
    /** Factor-plot fill when no objective is given (single-objective results). */
    band: string
    /** Histogram fill when no objective is given (single-objective results). */
    score: string
    /** The dashed reference line marking the selected point's value. */
    referenceLine: string
  }
  /** The Pareto front plot. Bands are independent of the 1D plot colors. */
  pareto: {
    /** Quality uncertainty band. Use an 8-digit hex (#RRGGBBAA) to control the
     *  band's translucency — the band fill has no separate opacity. */
    qualityBand: string
    /** Cost uncertainty band. The cost band is painted over the quality band,
     *  so keep an alpha (#RRGGBBAA) or it hides the quality band beneath it. */
    costBand: string
    /** Observed points that lie on the Pareto front. */
    optimal: string
    /** Observed points dominated by the front (marker outline). */
    dominated: string
    /** The Pareto front line. */
    front: string
    /** The dashed crosshair guides marking the selected point on the front. */
    guide: string
  }
  /** Cross-cutting accent: the selected Pareto point marker and the result
   *  card's header chip / selection border. */
  selectedPoint: string
}

export const defaultPlotColors: PlotColors = {
  row: {
    quality: '#e2e8ec',
    cost: '#ede8e2',
  },
  oneD: {
    qualityBand: '#a3d764',
    qualityScore: '#76c7c0',
    costBand: '#e0a96d',
    costScore: '#d98a5b',
    band: '#a3d764',
    score: '#76c7c0',
    referenceLine: '#000000',
  },
  pareto: {
    // 8-digit hex: the band fill's opacity comes from the alpha channel.
    qualityBand: '#a3d764d9', // ~0.85 alpha
    costBand: '#e0a96d99', // ~0.6 alpha (translucent so the quality band shows)
    optimal: '#2b5879',
    dominated: '#999999',
    front: '#000000',
    guide: '#077ace',
  },
  selectedPoint: '#077ace',
}

/** Per-section partial: override any subset of any section, or the accents. */
export type PartialPlotColors = {
  row?: Partial<PlotColors['row']>
  oneD?: Partial<PlotColors['oneD']>
  pareto?: Partial<PlotColors['pareto']>
  selectedPoint?: string
}

declare module '@mui/material/styles' {
  interface Palette {
    plots?: PartialPlotColors
  }
  interface PaletteOptions {
    plots?: PartialPlotColors
  }
}

/**
 * Plot colors resolved from the MUI theme (`palette.plots`), deep-merged over
 * the defaults section by section. Set `palette.plots` in your theme to restyle
 * any plot surface; omitted keys fall back to the defaults above.
 */
export const usePlotColors = (): PlotColors => {
  const { palette } = useTheme()
  const overrides = palette.plots ?? {}
  return {
    row: { ...defaultPlotColors.row, ...(overrides.row ?? {}) },
    oneD: { ...defaultPlotColors.oneD, ...(overrides.oneD ?? {}) },
    pareto: { ...defaultPlotColors.pareto, ...(overrides.pareto ?? {}) },
    selectedPoint: overrides.selectedPoint ?? defaultPlotColors.selectedPoint,
  }
}
