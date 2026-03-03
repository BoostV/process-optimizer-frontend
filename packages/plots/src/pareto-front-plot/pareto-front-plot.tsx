import {
  Area,
  Scatter,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Line,
  ReferenceLine,
} from 'recharts'
import useStyles from './pareto-front-plot.style'

type Props = {
  plot: {
    front_x_data: number[][]
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
   
  observations: { x: number; y: number }[]
  colors?: {
    best?: string
  }
}

export default function ParetoFrontPlot({ plot, observations, colors }: Props) {
  const { classes } = useStyles()

  console.log(plot.front_x_data)

  const chartData = plot.front_y_data.map((yPair, i) => ({
    x: yPair[0],
    y: yPair[1],
    uncertaintyY: [
      yPair[1] - Number(plot.obj2_error[i] || 0),
      yPair[1] + Number(plot.obj2_error[i] || 0),
    ],
  }))

  const best = [
    plot.front_y_data[plot.best_idx]?.[0],
    plot.front_y_data[plot.best_idx]?.[1],
  ]

  const variablesAtBest = plot.front_x_data[plot.best_idx]

  // Create separate datasets for X uncertainty bounds
  const xLowerBoundData = plot.front_y_data.map((yPair, i) => ({
    x:
      yPair[0] -
      (Array.isArray(plot.obj1_error[i])
        ? plot.obj1_error[i][0]
        : plot.obj1_error[i] || 0),
    y: yPair[1],
  }))

  const xUpperBoundData = plot.front_y_data.map((yPair, i) => ({
    x:
      yPair[0] +
      (Array.isArray(plot.obj1_error[i])
        ? plot.obj1_error[i][0]
        : plot.obj1_error[i] || 0),
    y: yPair[1],
  }))

  // Calculate domain from all data sources
  const allXValues = [
    ...xLowerBoundData.map(d => d.x),
    ...xUpperBoundData.map(d => d.x),
    ...chartData.map(d => d.x),
    ...observations.map(d => d.x),
  ]
  const allYValues = [
    ...xLowerBoundData.map(d => d.y),
    ...xUpperBoundData.map(d => d.y),
    ...chartData.map(d => d.y),
    ...observations.map(d => d.y),
  ]

  // Add 5% padding to the domain
  const xMin = Math.min(...allXValues)
  const xMax = Math.max(...allXValues)
  const xRange = xMax - xMin
  const xPadding = xRange * 0.05

  const yMin = Math.min(...allYValues)
  const yMax = Math.max(...allYValues)
  const yRange = yMax - yMin
  const yPadding = yRange * 0.05

  const xDomain = [xMin - xPadding, xMax + xPadding]
  const yDomain = [yMin - yPadding, yMax + yPadding]

  // Format axis values to 2 decimal places
  const formatTick = (value: number) => value.toFixed(2)

  return (
    <div className={classes.container}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          width={600}
          height={400}
          data={chartData}
          margin={{ top: 0, right: 0, bottom: 0, left: 4 }}
        >
          <XAxis
            type="number"
            dataKey="x"
            domain={xDomain}
            tickFormatter={formatTick}
            label={{ value: 'Quality', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            type="number"
            domain={yDomain}
            tickFormatter={formatTick}
            label={{ value: 'Cost', angle: -90, position: 'insideLeft' }}
          />
          {/* <Tooltip
            content={({ payload }) => {
              console.log(payload)
              if (!payload || !payload.length) {
                return null
              }
              
              onClick?.(payload)
              return (
                <div
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    padding: '10px',
                    borderRadius: '8px',
                  }}
                >
                  <div>{paretoFront.payload.x}</div>
                  <div>{paretoFront.payload.y}</div>
                </div>
              )
            }}
          /> */}
          <Legend wrapperStyle={{ paddingTop: '16px' }} />
          <Area
            type="linear"
            dataKey="uncertaintyY"
            fill="#f6c47e"
            fillOpacity={0.4}
            stroke="none"
            name="UncertaintyY"
          />
          <Scatter
            name="Data points"
            dataKey={'y'}
            data={observations}
            fill="grey"
          ></Scatter>
          <Line
            type="linear"
            dataKey="y"
            stroke="black"
            strokeWidth={2}
            dot={{ r: 2, stroke: 'none', fill: 'black' }}
            name="Pareto front"
            onClick={e => console.log(e)}
          ></Line>
          <Line
            type="linear"
            data={xLowerBoundData}
            dataKey="y"
            stroke="green"
            strokeWidth={1}
            dot={false}
            activeDot={false}
            name="Uncertainty X Lower Bound"
            hide={false}
          />
          <Line
            type="linear"
            data={xUpperBoundData}
            dataKey="y"
            stroke="green"
            strokeWidth={1}
            dot={false}
            activeDot={false}
            name="Uncertainty X Upper Bound"
            hide={false}
          />
          {/* Reference lines from Best point to axes */}
          <ReferenceLine
            segment={[
              { x: best[0], y: best[1] },
              { x: best[0], y: yDomain[0] },
            ]}
            stroke={colors?.best || '#EB9605'}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <ReferenceLine
            segment={[
              { x: best[0], y: best[1] },
              { x: xDomain[0], y: best[1] },
            ]}
            stroke="#EB9605"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <Scatter
            name="Best"
            dataKey={'y'}
            data={[{ x: best[0], y: best[1] }]}
            fill="#EB9605"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className={classes.tooltipContainer}>
        <div className={classes.tooltip}>
          {best[0] !== undefined && best[1] !== undefined ? (
            <>
              <div>
                <strong>Best point</strong>
              </div>
              {variablesAtBest?.map((v, i) => (
                <div key={i}>{`Variable ${i + 1}: ${v.toFixed(8)}`}</div>
              ))}
            </>
          ) : (
            <div>No best point found</div>
          )}
        </div>
      </div>
    </div>
  )
}
