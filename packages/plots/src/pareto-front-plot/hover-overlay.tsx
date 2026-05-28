import { displayQuality } from '@boostv/process-optimizer-frontend-core'
import { useDataToPixel } from './use-data-to-pixel'

const LABEL_WIDTH = 140
const LABEL_GAP = 6
const LINE_HEIGHT = 16

type Props = {
  hoverIndex: number | null
  setHoverIndex: (i: number | null) => void
  onSelectIndex?: (i: number) => void
  frontYData: [number, number][]
  frontXData: (number | string)[][]
  variableNames: string[]
  xDomain: [number, number]
  yDomain: [number, number]
}

// A single <Customized> SVG overlay that both captures pointer interaction
// (via a transparent rect over the plot area) and renders the hover marks
// (vertical guide, snapped dot, label). All positioning goes through the
// shared useDataToPixel hook (Recharts v3 usePlotArea) — no querySelector,
// no Recharts-internal class lookups, no imperative DOM mutation.
export const HoverOverlay = ({
  hoverIndex,
  setHoverIndex,
  onSelectIndex,
  frontYData,
  frontXData,
  variableNames,
  xDomain,
  yDomain,
}: Props) => {
  const proj = useDataToPixel(xDomain, yDomain)
  if (proj === null) {
    return null
  }
  const { xToPx, yToPx, plotArea } = proj

  // Map a mouse event to a data-space x using the SVG coordinate system.
  const eventToDataX = (e: React.MouseEvent<SVGRectElement>): number | null => {
    const svg = e.currentTarget.ownerSVGElement
    const ctm = svg?.getScreenCTM()
    if (!svg || !ctm) {
      return null
    }
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const local = pt.matrixTransform(ctm.inverse())
    const rel = (local.x - plotArea.x) / plotArea.width
    if (rel < 0 || rel > 1) {
      return null
    }
    return xDomain[0] + rel * (xDomain[1] - xDomain[0])
  }

  // xValue is in display units (positive quality); front_y_data[i][0] is in
  // backend units (negated quality). Compare in display units.
  const nearestIndex = (xValue: number): number => {
    let nearest = 0
    let minDist = Infinity
    for (let i = 0; i < frontYData.length; i++) {
      const yPair = frontYData[i]
      if (!yPair) {
        continue
      }
      const dist = Math.abs(displayQuality(yPair[0]) - xValue)
      if (dist < minDist) {
        minDist = dist
        nearest = i
      }
    }
    return nearest
  }

  const handleMove = (e: React.MouseEvent<SVGRectElement>) => {
    const x = eventToDataX(e)
    setHoverIndex(x === null ? null : nearestIndex(x))
  }
  const handleClick = (e: React.MouseEvent<SVGRectElement>) => {
    if (!onSelectIndex) {
      return
    }
    const x = eventToDataX(e)
    if (x !== null) {
      onSelectIndex(nearestIndex(x))
    }
  }

  const point = hoverIndex !== null ? frontYData[hoverIndex] : undefined
  const cx = point ? xToPx(displayQuality(point[0])) : 0
  const cy = point ? yToPx(point[1]) : 0
  const coords = hoverIndex !== null ? (frontXData[hoverIndex] ?? []) : []
  const labelLines = point
    ? [
        `Quality: ${displayQuality(point[0]).toFixed(2)}`,
        `Cost: ${point[1].toFixed(2)}`,
        ...variableNames.map((name, i) => {
          const v = coords[i]
          return v === undefined
            ? ''
            : `${name}: ${typeof v === 'number' ? v.toFixed(4) : v}`
        }),
      ].filter(Boolean)
    : []

  // Place the label to the right of the point by default, but flip it to the
  // left when it would overflow the plot's right edge (where it would be
  // clipped or collide with the legend panel). Clamp within the plot area as a
  // final guard for very narrow charts.
  const labelHeight = labelLines.length * LINE_HEIGHT + 6
  const rawLabelX =
    cx + LABEL_GAP + LABEL_WIDTH <= plotArea.x + plotArea.width
      ? cx + LABEL_GAP
      : cx - LABEL_GAP - LABEL_WIDTH
  const labelX = Math.max(
    plotArea.x,
    Math.min(rawLabelX, plotArea.x + plotArea.width - LABEL_WIDTH)
  )
  const labelY = plotArea.y + 4

  return (
    <g>
      {point && (
        <g pointerEvents="none">
          <line
            x1={cx}
            y1={plotArea.y}
            x2={cx}
            y2={plotArea.y + plotArea.height}
            stroke="rgba(43, 88, 121, 0.4)"
            strokeDasharray="4 3"
          />
          <circle
            cx={cx}
            cy={cy}
            r={5}
            fill="#077ace"
            stroke="white"
            strokeWidth={2}
          />
          <g transform={`translate(${labelX}, ${labelY})`}>
            <rect
              x={0}
              y={0}
              width={LABEL_WIDTH}
              height={labelHeight}
              fill="rgba(255,255,255,0.85)"
              rx={3}
            />
            {labelLines.map((t, i) => (
              <text
                key={i}
                x={6}
                y={16 + i * LINE_HEIGHT}
                fontSize={12}
                fill="#2b5879"
              >
                {t}
              </text>
            ))}
          </g>
        </g>
      )}
      <rect
        x={plotArea.x}
        y={plotArea.y}
        width={plotArea.width}
        height={plotArea.height}
        fill="transparent"
        style={{ cursor: onSelectIndex ? 'pointer' : 'default' }}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
        onClick={handleClick}
      />
    </g>
  )
}
