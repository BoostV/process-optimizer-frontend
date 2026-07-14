import { useState } from 'react'
import {
  displayQuality,
  displayQualityCI,
  displayCostCI,
} from '@boostv/process-optimizer-frontend-core'
import { usePlotColors } from '../colors'
import { useDataToPixel } from './use-data-to-pixel'
import { ConfidenceEllipses } from './overlays/confidence-ellipses'

const LABEL_WIDTH = 170
const LABEL_GAP = 6
const LINE_HEIGHT = 16

// Geometry of the numbered "#id" rectangles, mirrored from makePointLabel
// (point-label.tsx) so we can hit-test them here. The label layer sits below
// this overlay's transparent interaction rect, so it can't receive its own
// pointer events — the observed-point hover is detected here instead.
const POINT_LABEL_FONT = 12
const POINT_LABEL_PAD = 4
const pointLabelSize = (id: number | string) => ({
  width: `#${id}`.length * 7 + POINT_LABEL_PAD * 2,
  height: POINT_LABEL_FONT + POINT_LABEL_PAD * 2,
})

type ObservedPoint = {
  id: number | string
  // Plotted coordinates in axis units: x is display quality, y is cost.
  x: number
  y: number
  // Input factor values, aligned to `variableNames`.
  settings: (number | string)[]
}

type Props = {
  onSelectIndex?: (i: number) => void
  frontYData: [number, number][]
  frontXData: (number | string)[][]
  variableNames: string[]
  // Show a 95% confidence ellipse for the hovered front point.
  showHoverEllipse?: boolean
  obj1Error: number[]
  obj2Error: number[]
  // Observed data points, for the settings pop-up shown when the pointer
  // enters a numbered "#id" rectangle.
  observedPoints: ObservedPoint[]
}

// A single <Customized> SVG overlay that both captures pointer interaction
// (via a transparent rect over the plot area) and renders the hover marks
// (vertical guide, snapped dot, label, optional confidence ellipse). All
// positioning goes through the shared useDataToPixel hook (Recharts v3
// usePlotArea) — no querySelector, no Recharts-internal class lookups, no
// imperative DOM mutation.
//
// The hovered index is owned here, not by the parent ParetoFrontPlot. That is
// deliberate and load-bearing for performance: a mousemove updates only this
// overlay's state, so React re-renders just this small <g> — the surrounding
// 200-point chart (axes, line, area, bands, scatters) does not re-render on
// every pointer move. Lifting this state to the parent re-rendered the whole
// ComposedChart per move (~27ms each).
export const HoverOverlay = ({
  onSelectIndex,
  frontYData,
  frontXData,
  variableNames,
  showHoverEllipse = false,
  obj1Error,
  obj2Error,
  observedPoints,
}: Props) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [hoverDataIndex, setHoverDataIndex] = useState<number | null>(null)
  const proj = useDataToPixel()
  const { selectedPoint, pareto } = usePlotColors()
  if (proj === null) {
    return null
  }
  const { xToPx, yToPx, pxToDataX, plotArea } = proj

  // Local SVG-space coordinate of a pointer event (shared by the front picker
  // and the observed-point rectangle hit-test).
  const eventToLocal = (
    e: React.MouseEvent<SVGRectElement>
  ): { x: number; y: number } | null => {
    const svg = e.currentTarget.ownerSVGElement
    const ctm = svg?.getScreenCTM()
    if (!svg || !ctm) {
      return null
    }
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const local = pt.matrixTransform(ctm.inverse())
    return { x: local.x, y: local.y }
  }

  // Index of the observed point whose numbered "#id" rectangle contains the
  // given local point, or null. Iterate in reverse so the topmost-painted
  // label wins when rectangles overlap.
  const dataPointAt = (localX: number, localY: number): number | null => {
    for (let i = observedPoints.length - 1; i >= 0; i--) {
      const p = observedPoints[i]
      if (!p) {
        continue
      }
      const px = xToPx(p.x)
      const py = yToPx(p.y)
      const { width, height } = pointLabelSize(p.id)
      const rectX = px - width / 2
      const rectY = py - 5 - height
      if (
        localX >= rectX &&
        localX <= rectX + width &&
        localY >= rectY &&
        localY <= rectY + height
      ) {
        return i
      }
    }
    return null
  }

  // Map a mouse event to a data-space x using the SVG coordinate system and
  // Recharts' own inverse scale (so picking matches where the front is drawn).
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
    if (local.x < plotArea.x || local.x > plotArea.x + plotArea.width) {
      return null
    }
    return pxToDataX(local.x)
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
    // A numbered "#id" rectangle takes precedence over the front picker: when
    // the pointer is inside one, show that observed point's settings and
    // suppress the front hover.
    const local = eventToLocal(e)
    const di = local === null ? null : dataPointAt(local.x, local.y)
    if (di !== null) {
      setHoverDataIndex(di)
      setHoverIndex(null)
      return
    }
    setHoverDataIndex(null)
    const x = eventToDataX(e)
    setHoverIndex(x === null ? null : nearestIndex(x))
  }
  const handleClick = (e: React.MouseEvent<SVGRectElement>) => {
    if (!onSelectIndex) {
      return
    }
    // Don't change the selected front point when clicking a numbered rectangle.
    const local = eventToLocal(e)
    if (local !== null && dataPointAt(local.x, local.y) !== null) {
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
  // Show the predicted 95% range for quality and cost (rather than the central
  // value), matching the 1D single-point display. displayQualityCI handles the
  // quality sign flip internally. Fall back to the central value when no
  // uncertainty is available for that objective (the helpers return '').
  const qualityStd = hoverIndex !== null ? (obj1Error[hoverIndex] ?? 0) : 0
  const costStd = hoverIndex !== null ? (obj2Error[hoverIndex] ?? 0) : 0
  const qualityRange = point ? displayQualityCI(point[0], qualityStd) : ''
  const costRange = point ? displayCostCI(point[1], costStd) : ''
  const labelLines = point
    ? [
        `Quality: ${qualityRange || displayQuality(point[0]).toFixed(2)}`,
        `Cost: ${costRange || point[1].toFixed(2)}`,
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

  // Observed-point settings pop-up: shown when the pointer is inside a numbered
  // "#id" rectangle. Lists the point's input factor settings plus its observed
  // quality/cost (central values — these are measured, not predicted ranges).
  const dp =
    hoverDataIndex !== null ? observedPoints[hoverDataIndex] : undefined
  const dpCx = dp ? xToPx(dp.x) : 0
  const dpCy = dp ? yToPx(dp.y) : 0
  const dpLines = dp
    ? [
        `Point #${dp.id}`,
        `Quality: ${dp.x.toFixed(2)}`,
        `Cost: ${dp.y.toFixed(2)}`,
        ...variableNames.map((name, i) => {
          const v = dp.settings[i]
          return v === undefined
            ? ''
            : `${name}: ${typeof v === 'number' ? v.toFixed(4) : v}`
        }),
      ].filter(Boolean)
    : []
  const dpLabelHeight = dpLines.length * LINE_HEIGHT + 6
  const dpRawX =
    dpCx + LABEL_GAP + LABEL_WIDTH <= plotArea.x + plotArea.width
      ? dpCx + LABEL_GAP
      : dpCx - LABEL_GAP - LABEL_WIDTH
  const dpLabelX = Math.max(
    plotArea.x,
    Math.min(dpRawX, plotArea.x + plotArea.width - LABEL_WIDTH)
  )
  const dpLabelY = Math.max(
    plotArea.y,
    Math.min(dpCy + LABEL_GAP, plotArea.y + plotArea.height - dpLabelHeight)
  )

  return (
    <g>
      {showHoverEllipse && hoverIndex !== null && (
        <ConfidenceEllipses
          ellipseIndices={[hoverIndex]}
          frontYData={frontYData}
          obj1Error={obj1Error}
          obj2Error={obj2Error}
        />
      )}
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
            fill={selectedPoint}
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
                fill={pareto.optimal}
              >
                {t}
              </text>
            ))}
          </g>
        </g>
      )}
      {dp && (
        <g pointerEvents="none">
          <circle
            cx={dpCx}
            cy={dpCy}
            r={5}
            fill="none"
            stroke={selectedPoint}
            strokeWidth={2}
          />
          <g transform={`translate(${dpLabelX}, ${dpLabelY})`}>
            <rect
              x={0}
              y={0}
              width={LABEL_WIDTH}
              height={dpLabelHeight}
              fill="rgba(255,255,255,0.92)"
              stroke={pareto.optimal}
              strokeWidth={1}
              rx={3}
            />
            {dpLines.map((t, i) => (
              <text
                key={i}
                x={6}
                y={16 + i * LINE_HEIGHT}
                fontSize={12}
                fill={pareto.optimal}
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
        onMouseLeave={() => {
          setHoverIndex(null)
          setHoverDataIndex(null)
        }}
        onClick={handleClick}
      />
    </g>
  )
}
