import {
  Area,
  Scatter,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ComposedChart,
  Line,
  ReferenceLine,
} from 'recharts'
import type { DataEntry } from '@boostv/process-optimizer-frontend-core'
import useStyles from './pareto-front-plot.style'

type Props = {
  indexOfSelected: number
  plot: {
    front_x_data: number[][]
    front_y_data: [number, number][]
    obj1_error: [number, number, number][]
    obj2_error: [number, number, number][]
    obj1_1D_data: [...number[][], number][]
    obj2_1D_data: [...number[][], number][]
    obj1_mean: number
    obj1_std: number
    obj2_mean: number
    obj2_std: number
    best_idx: number
  }
  width?: number | string
  maxWidth?: number | string
  altText?: string
  dataPoints: DataEntry[]
}

export default function ParetoFrontPlot({
  indexOfSelected,
  plot,
  dataPoints,
}: Props) {
  const { classes } = useStyles()

  // Transform DataEntry[] to {x, y, id}[] format
  const dataPointsMapped = dataPoints.map(entry => {
    const qualityPoint = entry.data.find(
      d => d.type === 'score' && d.name === 'quality'
    )
    const costPoint = entry.data.find(
      d => d.type === 'score' && d.name === 'cost'
    )
    return {
      x: qualityPoint?.value ?? 0,
      y: costPoint?.value ?? 0,
      id: entry.meta.id,
    }
  })

  const chartData = plot.front_y_data.map((yPair, i) => ({
    x: yPair[0],
    y: yPair[1],
    uncertaintyY: [
      yPair[1] - Number(plot.obj2_error[i] || 0),
      yPair[1] + Number(plot.obj2_error[i] || 0),
    ],
  }))

  const selected = [
    plot.front_y_data[indexOfSelected]?.[0],
    plot.front_y_data[indexOfSelected]?.[1],
  ]

  const variablesAtSelected = plot.front_x_data[indexOfSelected]
  const isBest = indexOfSelected === plot.best_idx
  const selectedLabel = isBest ? 'Selected point (best)' : 'Selected point'

  // Get variable names from dataPoints (excluding scores)
  const variableNames =
    dataPoints[0]?.data.filter(d => d.type !== 'score').map(d => d.name) ?? []

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
    ...dataPointsMapped.map(d => d.x),
  ].filter((v): v is number => typeof v === 'number')
  const allYValues = [
    ...xLowerBoundData.map(d => d.y),
    ...xUpperBoundData.map(d => d.y),
    ...chartData.map(d => d.y),
    ...chartData.flatMap(d => d.uncertaintyY), // Include uncertainty bounds
    ...dataPointsMapped.map(d => d.y),
  ].filter((v): v is number => typeof v === 'number')

  // Add 2% padding to the domain
  const xMin = Math.min(...allXValues)
  const xMax = Math.max(...allXValues)
  const xRange = xMax - xMin
  const xPadding = xRange * 0.02

  const yMin = Math.min(...allYValues)
  const yMax = Math.max(...allYValues)
  const yRange = yMax - yMin
  const yPadding = yRange * 0.02

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
          margin={{ top: 0, right: 0, bottom: 10, left: 4 }}
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
            data={dataPointsMapped}
            fill="grey"
            label={{
              position: 'top',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              content: (props: any) => {
                const { x, y, id } = props
                if (!id) {
                  return null
                }
                const text = `#${id}`
                const padding = 4
                const fontSize = 12
                const width = text.length * 7 + padding * 2
                const height = fontSize + padding * 2
                const rectX = x - width / 2
                const rectY = y - 10 - height

                return (
                  <g>
                    <rect
                      x={rectX}
                      y={rectY}
                      width={width}
                      height={height}
                      fill="white"
                      stroke="#999"
                      strokeWidth={1}
                      rx={2}
                    />
                    <text
                      x={x}
                      y={rectY + height / 2}
                      fill="#666"
                      fontSize={fontSize}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {text}
                    </text>
                  </g>
                )
              },
            }}
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
          {/* Reference lines from selected point to axes */}
          <ReferenceLine
            segment={[
              { x: selected[0], y: selected[1] },
              { x: selected[0], y: yDomain[0] },
            ]}
            stroke={'#3d77ff'}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <ReferenceLine
            segment={[
              { x: selected[0], y: selected[1] },
              { x: xDomain[0], y: selected[1] },
            ]}
            stroke="#3d77ff"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <Scatter
            name="Selected"
            dataKey={'y'}
            data={[{ x: selected[0], y: selected[1] }]}
            fill="#3d77ff"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className={classes.tooltipContainer}>
        <div className={classes.tooltip}>
          {selected[0] !== undefined && selected[1] !== undefined ? (
            <>
              <div>
                <strong>{selectedLabel}</strong>
              </div>
              {variablesAtSelected?.map((v, i) => (
                <div key={i} className={classes.selectedPointVariable}>
                  {variableNames[i]
                    ? `${variableNames[i]}: ${v.toFixed(8)}`
                    : `Variable ${i + 1}: ${v.toFixed(8)}`}
                </div>
              ))}
            </>
          ) : (
            <div>No selected point found</div>
          )}

          <div className={classes.divider} />

          <div className={classes.legendItem}>
            <div
              className={classes.legendColorCircle}
              style={{ background: '#3d77ff' }}
            />
            <span>Selected point</span>
          </div>
          <div className={classes.legendItem}>
            <div
              className={classes.legendColorCircle}
              style={{ background: 'grey' }}
            />
            <span>Data points</span>
          </div>
          <div className={classes.legendItem}>
            <div
              className={classes.legendColorLine}
              style={{ background: 'black' }}
            />
            <span>Pareto front</span>
          </div>
          <div className={classes.legendItem}>
            <div
              className={classes.legendColor}
              style={{ background: '#f6c47e', opacity: 0.6 }}
            />
            <span>Uncertainty (quality)</span>
          </div>
          <div className={classes.legendItem}>
            <div
              className={classes.legendColorLine}
              style={{ background: 'green' }}
            />
            <span>Uncertainty (cost)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
