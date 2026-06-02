import { darken } from '@mui/material/styles'
import { usePlotColors } from '../../colors'
import { useDataToPixel } from '../use-data-to-pixel'

type Props = {
  xLowerBoundData: { x: number; y: number }[]
  xUpperBoundData: { x: number; y: number }[]
}

// Smooth filled band for the quality-axis uncertainty. Drawn as a closed
// SVG <path> via Customized so we can use cubic Bezier interpolation
// between adjacent front points — softer than Recharts' polyline join.
export const QualityUncertaintyBand = ({
  xLowerBoundData,
  xUpperBoundData,
}: Props) => {
  const proj = useDataToPixel()
  const { quality } = usePlotColors()
  if (!proj) {
    return null
  }
  if (xLowerBoundData.length === 0) return null
  const { xToPx, yToPx } = proj

  // Build a single closed contour: upper bounds left-to-right, then lower
  // bounds right-to-left. Connecting the two creates a filled band.
  const contour: { x: number; y: number }[] = []
  for (let i = 0; i < xUpperBoundData.length; i++) {
    contour.push({
      x: xToPx(xUpperBoundData[i]!.x),
      y: yToPx(xUpperBoundData[i]!.y),
    })
  }
  for (let i = xLowerBoundData.length - 1; i >= 0; i--) {
    contour.push({
      x: xToPx(xLowerBoundData[i]!.x),
      y: yToPx(xLowerBoundData[i]!.y),
    })
  }

  // Build a smoothed path using Catmull-Rom-style cubic Beziers. For each
  // pair (P0, P1), use control points derived from (P-1, P0, P1, P2).
  const tension = 0.5 // 0 = sharp corners, 1 = very loose; 0.5 is a sweet spot.
  const segments: string[] = []
  for (let i = 0; i < contour.length; i++) {
    const p0 = contour[(i - 1 + contour.length) % contour.length]!
    const p1 = contour[i]!
    const p2 = contour[(i + 1) % contour.length]!
    const p3 = contour[(i + 2) % contour.length]!
    if (i === 0) {
      segments.push(`M ${p1.x} ${p1.y}`)
    }
    const cp1x = p1.x + ((p2.x - p0.x) * tension) / 6
    const cp1y = p1.y + ((p2.y - p0.y) * tension) / 6
    const cp2x = p2.x - ((p3.x - p1.x) * tension) / 6
    const cp2y = p2.y - ((p3.y - p1.y) * tension) / 6
    segments.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`)
  }
  segments.push('Z')

  // Drawn underneath the (now translucent) cost band. Keep the fill nearly
  // opaque so it reads on its own, and add a thin deeper-blue outline so its
  // edge stays visible through the cost band where the quality band is nested.
  return (
    <path
      d={segments.join(' ')}
      fill={quality}
      fillOpacity={0.85}
      stroke={darken(quality, 0.2)}
      strokeWidth={1}
      pointerEvents="none"
    />
  )
}
