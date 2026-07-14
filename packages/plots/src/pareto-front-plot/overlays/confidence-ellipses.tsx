import { displayQuality } from '@boostv/process-optimizer-frontend-core'
import { useDataToPixel } from '../use-data-to-pixel'

type Props = {
  ellipseIndices: number[]
  frontYData: [number, number][]
  obj1Error: number[]
  obj2Error: number[]
}

// Renders sampled 95% confidence ellipses along the front. Recharts
// <Customized> wraps the return in a <Layer> (an SVG <g>), so we render plain
// SVG <ellipse> elements positioned in pixel space.
export const ConfidenceEllipses = ({
  ellipseIndices,
  frontYData,
  obj1Error,
  obj2Error,
}: Props) => {
  const proj = useDataToPixel()
  if (!proj) {
    return null
  }
  const { xToPx, yToPx } = proj
  return (
    <g pointerEvents="none">
      {ellipseIndices.map(i => {
        const yPair = frontYData[i]
        if (!yPair) return null
        const cxData = displayQuality(yPair[0])
        const cyData = yPair[1]
        const e1 = obj1Error[i] ?? 0
        const e2 = obj2Error[i] ?? 0
        const cx = xToPx(cxData)
        const cy = yToPx(cyData)
        const rx = Math.abs(xToPx(cxData + e1) - cx)
        const ry = Math.abs(yToPx(cyData + e2) - cy)
        return (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill="rgba(7, 122, 206, 0.08)"
            stroke="rgba(7, 122, 206, 0.5)"
            strokeWidth={1}
          />
        )
      })}
    </g>
  )
}
