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
  data: { points, type = 'numeric', referenceLineX },
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

  return (
    <div style={{ width, maxWidth, height }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'options' ? (
          <BarChart
            margin={{ top: 0, right: 0, bottom: 0, left: -32 }}
            data={points}
          >
            <XAxis
              dataKey="x"
              tick={{ fontSize: 10 }}
              tickFormatter={formatValue}
            />
            <YAxis
              dataKey="y"
              tick={{ fontSize: 10 }}
              tickFormatter={formatValue}
            />
            <Tooltip
              formatter={formatTooltip}
              labelFormatter={formatValue}
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
            margin={{ top: 0, right: 0, bottom: 0, left: -32 }}
            data={points}
          >
            <XAxis
              dataKey="x"
              tick={{ fontSize: 10 }}
              tickFormatter={formatValue}
            />
            <YAxis
              dataKey="y"
              tick={{ fontSize: 10 }}
              tickFormatter={formatValue}
            />
            <Tooltip
              formatter={formatTooltip}
              labelFormatter={formatValue}
              contentStyle={{ background: 'white' }}
            />
            <Area
              type="monotone"
              dataKey="y"
              stroke="none"
              fillOpacity={1}
              fill={fillColor}
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
