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

export type OneDData = {
  points: {
    x: number | string
    y: number | number[]
  }[]
  type?: CombinedVariableInputType | 'score'
  referenceLineX?: number
  xDomain?: [number, number]
  yDomain?: [number, number]
}

type OneDPlotProps = {
  width?: number | string
  maxWidth?: number | string
  height?: number | string
  data: OneDData
}

export const OneDPlot = ({
  width,
  maxWidth,
  height,
  data: { points, type = 'numeric', referenceLineX, xDomain, yDomain },
}: OneDPlotProps) => {
  const fillColor = type === 'score' ? '#76c7c0' : '#a3d764'
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

  // Score (histogram) x-axis: show a fixed set of evenly-spaced ticks spanning
  // the domain (0..max) including both ends, instead of Recharts' default which
  // left only 2-3 sparse ticks on the narrow score distribution.
  const SCORE_TICK_COUNT = 6
  const scoreXTicks =
    type === 'score' && xDomain
      ? Array.from(
          { length: SCORE_TICK_COUNT },
          (_, i) =>
            xDomain[0] +
            ((xDomain[1] - xDomain[0]) * i) / (SCORE_TICK_COUNT - 1)
        )
      : undefined

  const [chartAreaRef, size] = useElementSize<HTMLDivElement>()
  const ready = size.width > 0 && size.height > 0

  return (
    <div ref={chartAreaRef} style={{ width, maxWidth, height }}>
      {ready &&
        (type === 'options' ? (
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
              {...(yDomain ? { domain: yDomain, allowDataOverflow: true } : {})}
            />
            <Tooltip
              formatter={formatTooltip}
              labelFormatter={formatTooltipLabel}
              contentStyle={{ background: 'white' }}
            />
            <Bar dataKey="y" fill={fillColor} />
            {resolvedReferenceLineX !== undefined && (
              <ReferenceLine
                x={resolvedReferenceLineX}
                stroke="black"
                strokeWidth={2}
                strokeDasharray="3 3"
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
              hide={type === 'score'}
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
              <ReferenceLine
                x={resolvedReferenceLineX}
                stroke="black"
                strokeWidth={2}
                strokeDasharray="3 3"
              />
            )}
          </AreaChart>
        ))}
    </div>
  )
}
