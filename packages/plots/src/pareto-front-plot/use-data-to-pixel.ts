import {
  usePlotArea,
  useXAxisScale,
  useYAxisScale,
  useXAxisInverseScale,
} from 'recharts'

export type PixelProjector = {
  xToPx: (x: number) => number
  yToPx: (y: number) => number
  // Inverse of xToPx: a pixel x (in the chart's coordinate system) → data x.
  pxToDataX: (px: number) => number
  plotArea: NonNullable<ReturnType<typeof usePlotArea>>
} | null

// Projects data <-> pixel coordinates using Recharts' OWN axis scales, so the
// overlay marks line up exactly with the series Recharts draws. A hand-rolled
// linear projection from the explicit domain drifted from the real scale (most
// visibly where the front is steep), because Recharts adjusts the effective
// domain/range. Returns null until the scales and plot area are ready.
export const useDataToPixel = (): PixelProjector => {
  const plotArea = usePlotArea()
  const xScale = useXAxisScale()
  const yScale = useYAxisScale()
  const xInverse = useXAxisInverseScale()
  if (
    !plotArea ||
    !xScale ||
    !yScale ||
    !xInverse ||
    plotArea.width === 0 ||
    plotArea.height === 0
  ) {
    return null
  }
  return {
    xToPx: (x: number) => xScale(x) as number,
    yToPx: (y: number) => yScale(y) as number,
    pxToDataX: (px: number) => xInverse(px) as number,
    plotArea,
  }
}
