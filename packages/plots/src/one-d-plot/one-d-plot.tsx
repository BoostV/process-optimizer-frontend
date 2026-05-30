import { CombinedVariableInputType } from '@boostv/process-optimizer-frontend-core'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export type OneDData = {
  points: {
    x: number | string
    y: number | number[]
  }[]
  type?: CombinedVariableInputType | 'score'
  referenceLineX?: number
  xDomain?: [number, number]
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
  data: { points, type = 'numeric', referenceLineX, xDomain },
}: OneDPlotProps) => {
  const fillColor = type === 'score' ? '#76c7c0' : '#a3d764'
  const resolvedReferenceLineX =
    referenceLineX !== undefined ? points[referenceLineX]?.x : undefined
  const formatValue = (value: number | string) =>
    typeof value === 'number' ? value.toFixed(2) : value
  const formatTooltip = (value: number | number[]) =>
    Array.isArray(value)
      ? value.map(v => v.toFixed(2)).join(', ')
      : formatValue(value)
  const formatTooltipLabel = (value: number | string) =>
    resolvedReferenceLineX !== undefined && value === resolvedReferenceLineX
      ? `${formatValue(value)} (best)`
      : formatValue(value)

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

  return (
    <div style={{ width, maxWidth, height }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'options' ? (
          <BarChart
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
            />
            <YAxis
              dataKey="y"
              width={yAxisWidth}
              tick={{ fontSize: 10 }}
              tickFormatter={formatValue}
              hide={type === 'score'}
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
        )}
      </ResponsiveContainer>
    </div>
  )
}
