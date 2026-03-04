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

type OneDPlotProps = {
  data: {
    x: number | string
    y: number | number[]
  }[]
  type?: 'score' | 'numeric' | 'categorical'
  width?: number | string
  maxWidth?: number | string
  height?: number | string
  referenceLineX?: number | string
}

export const OneDPlot = ({
  width,
  maxWidth,
  height,
  data,
  referenceLineX,
  type = 'numeric',
}: OneDPlotProps) => {
  const fillColor = type === 'score' ? '#76c7c0' : '#a3d764'

  return (
    <div style={{ width, maxWidth, height }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'categorical' ? (
          <BarChart
            margin={{ top: 0, right: 0, bottom: 0, left: -24 }}
            data={data}
          >
            <XAxis dataKey="x" />
            <YAxis dataKey="y" />
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
            margin={{ top: 0, right: 0, bottom: 0, left: -24 }}
            data={data}
          >
            <XAxis dataKey="x" />
            <YAxis dataKey="y" />
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
