import {
  Area,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Line,
  ErrorBar,
} from 'recharts'

type Props = {
  plot: {
    front_x_data: [number, number][]
    front_y_data: [number, number][]
    obj1_error: [number, number, number][]
    obj2_error: [number, number, number][]
    best_idx: number
    obj1_1D_data: [[[number], [number], [number], number]]
    obj2_1D_data: [[[number], [number], [number], number]]
    obj1_mean: number
    obj1_std: number
    obj2_mean: number
    obj2_std: number
  }
  width?: number | string
  maxWidth?: number | string
  altText?: string
}

// TODO: Observations are missing?
const dummyObservations = [
  { x: -3, y: 7 },
  { x: -2.5, y: 3 },
  { x: -2, y: 2 },
  { x: -1.9, y: 1 },
  { x: -1.8, y: 5 },
]

export default function ParetoFrontPlot({ plot }: Props) {
  const chartData = plot.front_y_data.map((yPair, i) => ({
    x: yPair[0],
    y: yPair[1],

    // Vertical uncertainty (orange band in matplotlib)
    uncertaintyY: [
      yPair[1] - Number(plot.obj2_error[i] || 0),
      yPair[1] + Number(plot.obj2_error[i] || 0),
    ],

    // Horizontal uncertainty (green band in matplotlib)
    uncertaintyX: plot.obj1_error[i],
  }))

  const best = [
    plot.front_y_data[plot.best_idx]?.[0],
    plot.front_y_data[plot.best_idx]?.[1],
  ]

  return (
    <div style={{ height: '600px', width: '600px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          width={600}
          height={400}
          data={chartData}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          {/* TODO: domain should be determined from the data, not hardcoded */}
          <XAxis type="number" dataKey="x" domain={[-3.5, -1.9]} />
          <YAxis type="number" domain={[0, 11]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          <Area
            type="linear"
            dataKey="uncertaintyY"
            fill="#f6c47e"
            fillOpacity={0.4}
            stroke="none"
            name="UncertaintyY"
          />
          <Scatter type="linear" dataKey="y" fill="none" name="Data points">
            <ErrorBar
              dataKey="uncertaintyX"
              width={0}
              strokeWidth={10}
              stroke="green"
              opacity={0.2}
              direction="x"
              isAnimationActive={false}
            />
          </Scatter>
          <Line
            type="linear"
            dataKey="y"
            stroke="black"
            strokeWidth={2}
            dot={{ r: 2, stroke: 'none', fill: 'black' }}
            name="Pareto front"
          />
          <Scatter
            name="Best"
            dataKey={'y'}
            data={[{ x: best[0], y: best[1] }]}
            fill="#EB9605"
          />
          <Scatter
            name="Observations"
            dataKey={'y'}
            data={dummyObservations}
            fill="grey"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
