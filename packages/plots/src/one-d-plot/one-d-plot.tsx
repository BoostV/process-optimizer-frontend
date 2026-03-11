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
  type?: 'score' | 'numeric' | 'categorical'
  referenceLineX?: number | string
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

  return (
    <div style={{ width, maxWidth, height }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'categorical' ? (
          <BarChart
            margin={{ top: 0, right: 0, bottom: 0, left: -32 }}
            data={points}
          >
            <XAxis dataKey="x" tick={{ fontSize: 10 }} />
            <YAxis dataKey="y" tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="y" fill={fillColor} />
            {referenceLineX !== undefined && (
              <ReferenceLine
                x={referenceLineX}
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
            <XAxis dataKey="x" tick={{ fontSize: 10 }} />
            <YAxis dataKey="y" tick={{ fontSize: 10 }} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="y"
              stroke="none"
              fillOpacity={1}
              fill={fillColor}
            />
            {referenceLineX !== undefined && (
              <ReferenceLine
                x={referenceLineX}
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
