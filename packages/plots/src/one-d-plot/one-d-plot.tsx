import { CombinedVariableInputType } from '@boostv/process-optimizer-frontend-core'
import { ReactNode } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ReferenceLine,
  Tooltip,
  TooltipValueType,
  XAxis,
  YAxis,
} from 'recharts'
import { useElementSize } from '../use-element-size'
import { usePlotColors } from '../colors'

export type OneDData = {
  points: {
    x: number | string
    y: number | number[]
  }[]
  type?: CombinedVariableInputType | 'score'
  // Which objective this plot belongs to. When set, the fill is themed
  // per-objective (quality* / cost* plot colors); when omitted the plot falls
  // back to the shared band/score colors (e.g. single-objective results).
  objective?: 'quality' | 'cost'
  referenceLineX?: number
  xDomain?: [number, number]
  yDomain?: [number, number]
}

type OneDPlotProps = {
  width?: number | string
  maxWidth?: number | string
  height?: number | string
  data: OneDData
  // Hide this plot's own y-axis. Used when a single shared y-axis is drawn once
  // for a whole row of plots (see axisOnly), so each data plot reclaims the
  // width its axis would have taken.
  hideYAxis?: boolean
  // Render only the y-axis, no data area. Used to draw the shared axis once at
  // the left of a row of plots. It keeps the same height and reserves the same
  // bottom (x-axis) space as the data plots and is pinned to the same yDomain,
  // so its ticks line up with the bands in the row.
  axisOnly?: boolean
}

export const OneDPlot = ({
  width,
  maxWidth,
  height,
  hideYAxis = false,
  axisOnly = false,
  data: {
    points,
    type = 'numeric',
    objective,
    referenceLineX,
    xDomain,
    yDomain,
  },
}: OneDPlotProps) => {
  const plotColors = usePlotColors()
  const isScore = type === 'score'
  // Per-objective fill when the objective is known (multi-objective results);
  // otherwise fall back to the shared band/score colors.
  const fillColor = (() => {
    const oneD = plotColors.oneD
    if (objective === 'quality') {
      return isScore ? oneD.qualityScore : oneD.qualityBand
    }
    if (objective === 'cost') {
      return isScore ? oneD.costScore : oneD.costBand
    }
    return isScore ? oneD.score : oneD.band
  })()
  const resolvedReferenceLineX =
    referenceLineX !== undefined ? points[referenceLineX]?.x : undefined
  const formatValue = (value: number | string) =>
    typeof value === 'number' ? value.toFixed(2) : value
  const formatTooltip = (value: TooltipValueType | undefined) => {
    if (Array.isArray(value)) {
      // Credible-interval band: show the low–high range explicitly.
      return `[${formatValue(value[0] ?? 0)} to ${formatValue(value[1] ?? 0)}]`
    }
    return typeof value === 'number' || typeof value === 'string'
      ? formatValue(value)
      : ''
  }
  const formatTooltipLabel = (label: ReactNode) => {
    if (typeof label !== 'number' && typeof label !== 'string') {
      return label
    }
    const isBest =
      resolvedReferenceLineX !== undefined && label === resolvedReferenceLineX
    return `x: ${formatValue(label)}${isBest ? ' (best)' : ''}`
  }

  // Calculate Y-axis width based on the maximum absolute Y value to ensure labels fit
  const yAxisWidth = (() => {
    const allY = points.flatMap(p =>
      Array.isArray(p.y) ? p.y : [p.y]
    ) as number[]
    if (allY.length === 0) {
      return 30
    }
    const maxAbsVal = Math.max(...allY.map(Math.abs))
    const formatted = maxAbsVal.toFixed(2)
    return Math.max(30, formatted.length * 7 + 5)
  })()

  const [chartAreaRef, size] = useElementSize<HTMLDivElement>()
  const ready = size.width > 0 && size.height > 0

  // Score (histogram) x-axis: show evenly-spaced ticks spanning the domain
  // (0..max) including both ends, instead of Recharts' default which left only
  // 2-3 sparse ticks on the narrow score distribution. Cap at 6 ticks, but in
  // crowded layouts (many factors → narrow plots, e.g. large experiments) drop
  // the count so the 2-decimal labels don't collide into an illegible smear.
  const SCORE_TICK_COUNT = 6
  const scoreXTicks = (() => {
    if (type !== 'score' || !xDomain) {
      return undefined
    }
    // Estimate the widest tick label (the domain endpoints, formatted) and how
    // many fit without overlapping across the axis (insets ~24px of padding).
    const labelPx =
      Math.max(formatValue(xDomain[0]).length, formatValue(xDomain[1]).length) *
        6 +
      6
    const innerWidth = Math.max(0, size.width - 24)
    const fit = Math.floor(innerWidth / labelPx) + 1
    const count = Math.max(2, Math.min(SCORE_TICK_COUNT, fit))
    return Array.from(
      { length: count },
      (_, i) => xDomain[0] + ((xDomain[1] - xDomain[0]) * i) / (count - 1)
    )
  })()

  return (
    <div ref={chartAreaRef} style={{ width, maxWidth, height }}>
      {ready &&
        (axisOnly ? (
          // Shared y-axis: only the axis, no data area. The blank x-axis tick
          // labels reserve the same bottom space as the data plots so the y
          // ticks align with them; the domain pins it to the row's scale.
          <AreaChart
            width={size.width}
            height={size.height}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            data={points}
          >
            <XAxis
              dataKey="x"
              tick={{ fontSize: 10 }}
              tickFormatter={() => ''}
            />
            <YAxis
              dataKey="y"
              width={yAxisWidth}
              tick={{ fontSize: 10 }}
              tickFormatter={formatValue}
              {...(yDomain ? { domain: yDomain, allowDataOverflow: true } : {})}
            />
          </AreaChart>
        ) : type === 'options' ? (
          <BarChart
            width={size.width}
            height={size.height}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            data={points}
          >
            <XAxis
              dataKey="x"
              tick={{ fontSize: 10 }}
              tickFormatter={formatValue}
            />
            <YAxis
              dataKey="y"
              width={yAxisWidth}
              tick={{ fontSize: 10 }}
              tickFormatter={formatValue}
              hide={hideYAxis}
              {...(yDomain ? { domain: yDomain, allowDataOverflow: true } : {})}
            />
            <Tooltip
              formatter={formatTooltip}
              labelFormatter={formatTooltipLabel}
              contentStyle={{ background: 'white' }}
            />
            <Bar dataKey="y" fill={fillColor} />
            {resolvedReferenceLineX !== undefined && (
              // Keep the selected-point guide on top of the bars/dots — see the
              // Pareto plot for the z-index rationale.
              <ReferenceLine
                x={resolvedReferenceLineX}
                stroke={plotColors.oneD.referenceLine}
                strokeWidth={2}
                strokeDasharray="3 3"
                zIndex={1300}
              />
            )}
          </BarChart>
        ) : (
          <AreaChart
            width={size.width}
            height={size.height}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            data={points}
          >
            <XAxis
              dataKey="x"
              tick={{ fontSize: 10 }}
              tickFormatter={formatValue}
              {...(xDomain
                ? {
                    type: 'number' as const,
                    domain: xDomain,
                    allowDataOverflow: true,
                  }
                : {})}
              {...(scoreXTicks
                ? {
                    ticks: scoreXTicks,
                    interval: 0 as const,
                    // Inset the axis so the 0 and max labels (centered on the
                    // edge ticks) aren't clipped by the chart bounds.
                    padding: { left: 10, right: 14 },
                  }
                : {})}
            />
            <YAxis
              dataKey="y"
              width={yAxisWidth}
              tick={{ fontSize: 10 }}
              tickFormatter={formatValue}
              hide={type === 'score' || hideYAxis}
              {...(yDomain ? { domain: yDomain, allowDataOverflow: true } : {})}
            />
            {type !== 'score' && (
              <Tooltip
                formatter={formatTooltip}
                labelFormatter={formatTooltipLabel}
                contentStyle={{ background: 'white' }}
              />
            )}
            <Area
              type="monotone"
              dataKey="y"
              stroke="none"
              fillOpacity={1}
              fill={fillColor}
              activeDot={type === 'score' ? false : undefined}
            />
            {resolvedReferenceLineX !== undefined && (
              // Keep the selected-point guide on top of the area fill/dots —
              // see the Pareto plot for the z-index rationale.
              <ReferenceLine
                x={resolvedReferenceLineX}
                stroke={plotColors.oneD.referenceLine}
                strokeWidth={2}
                strokeDasharray="3 3"
                zIndex={1300}
              />
            )}
          </AreaChart>
        ))}
    </div>
  )
}
