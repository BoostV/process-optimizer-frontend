import { ReactNode, useState } from 'react'
import {
  Area,
  Customized,
  Scatter,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ComposedChart,
  Line,
  ReferenceLine,
} from 'recharts'
import {
  displayQuality,
  type DataEntry,
  type ParetoPlot,
} from '@boostv/process-optimizer-frontend-core'
import useStyles from './pareto-front-plot.style'
import { makePointLabel } from './point-label'
import { ConfidenceEllipses } from './overlays/confidence-ellipses'
import { QualityUncertaintyBand } from './overlays/uncertainty-band'
import { HoverOverlay } from './hover-overlay'

// Available uncertainty visualization modes for the Pareto plot.
// Exported so parent components can drive a mode selector UI.
export const paretoVisualizationModes = [
  { id: 'ellipses', label: 'Confidence ellipses' },
  { id: 'band', label: 'Uncertainty band' },
] as const

export type ParetoVisualizationMode =
  (typeof paretoVisualizationModes)[number]['id']

type Props = {
  indexOfSelected: number
  plot: ParetoPlot
  width?: number | string
  maxWidth?: number | string
  altText?: string
  dataPoints: DataEntry[]
  onSelectIndex?: (index: number) => void
  onResetToDefault?: () => void
  renderControls?: (api: {
    onToggleFitToFront: () => void
    onResetToDefault: () => void
  }) => ReactNode
  visualizationMode?: ParetoVisualizationMode
  visualizationModeSelector?: ReactNode
  styles?: {
    legendBorderColor?: string
  }
}

export default function ParetoFrontPlot({
  indexOfSelected,
  plot,
  dataPoints,
  onSelectIndex,
  onResetToDefault,
  renderControls,
  visualizationMode = 'ellipses',
  visualizationModeSelector,
  styles,
}: Props) {
  const { classes } = useStyles()
  const [fitToFront, setFitToFront] = useState(false)

  // Transform DataEntry[] to {x, y, id}[] format
  const dataPointsMapped: { x: number; y: number; id: number }[] =
    dataPoints.map(entry => {
      const qualityPoint = entry.data.find(
        d => d.type === 'score' && d.name === 'quality'
      )
      const costPoint = entry.data.find(
        d => d.type === 'score' && d.name === 'cost'
      )
      return {
        x: Number(qualityPoint?.value ?? 0),
        y: Number(costPoint?.value ?? 0),
        id: entry.meta.id,
      }
    })

  // Split observed points by Pareto-optimality (in observed quality/cost space:
  // higher quality, lower cost is better). Optimal points render filled in
  // brand color; dominated points stay muted gray.
  const isObservedParetoOptimal = (p: { x: number; y: number }) =>
    !dataPointsMapped.some(
      o => o !== p && o.x >= p.x && o.y <= p.y && (o.x > p.x || o.y < p.y)
    )
  const observedParetoOptimal = dataPointsMapped.filter(isObservedParetoOptimal)
  const observedDominated = dataPointsMapped.filter(
    p => !isObservedParetoOptimal(p)
  )

  // Quality is sent to the backend negated (we want to maximize); cost is sent
  // as-is (we want to minimize). The backend echoes both back in those units,
  // so for display we flip quality but leave cost alone — see core
  // `displayQuality`.
  const chartData = plot.front_y_data.map((yPair, i) => ({
    x: displayQuality(yPair[0]),
    y: yPair[1],
    uncertaintyY: [
      yPair[1] - Number(plot.obj2_error[i] || 0),
      yPair[1] + Number(plot.obj2_error[i] || 0),
    ],
  }))

  const rawSelected = plot.front_y_data[indexOfSelected]
  const selected = [
    rawSelected !== undefined ? displayQuality(rawSelected[0]) : undefined,
    rawSelected?.[1],
  ]

  const variablesAtSelected = plot.front_x_data[indexOfSelected]
  const isBest = indexOfSelected === plot.best_idx
  const selectedLabel = isBest ? 'Selected point (default)' : 'Selected point'

  // Get variable names from dataPoints (excluding scores)
  const variableNames =
    dataPoints[0]?.data.filter(d => d.type !== 'score').map(d => d.name) ?? []

  // Create separate datasets for X uncertainty bounds
  const xLowerBoundData = plot.front_y_data.map((yPair, i) => ({
    x: displayQuality(yPair[0]) - (plot.obj1_error[i] ?? 0),
    y: yPair[1],
  }))

  const xUpperBoundData = plot.front_y_data.map((yPair, i) => ({
    x: displayQuality(yPair[0]) + (plot.obj1_error[i] ?? 0),
    y: yPair[1],
  }))

  // Sample ~10 front points to draw 95% confidence ellipses at. Each ellipse's
  // semi-axes are the per-objective 1.96-sigma errors at that point, so the
  // shape communicates joint uncertainty along the front without the continuous
  // band overpowering the rest of the chart.
  const ELLIPSE_COUNT = 10
  const frontLen = plot.front_y_data.length
  const ellipseIndices =
    frontLen <= ELLIPSE_COUNT
      ? plot.front_y_data.map((_, i) => i)
      : Array.from({ length: ELLIPSE_COUNT }, (_, k) =>
          Math.round((k * (frontLen - 1)) / (ELLIPSE_COUNT - 1))
        )

  // Calculate domain from all data sources. The band-uncertainty bounds only
  // render in 'band' mode, so they should only influence the axis domain in
  // that mode — otherwise switching modes silently rescales the chart.
  const bandX =
    visualizationMode === 'band'
      ? [...xLowerBoundData.map(d => d.x), ...xUpperBoundData.map(d => d.x)]
      : []
  const bandY =
    visualizationMode === 'band'
      ? [...xLowerBoundData.map(d => d.y), ...xUpperBoundData.map(d => d.y)]
      : []
  const allXValues = [
    ...bandX,
    ...chartData.map(d => d.x),
    ...dataPointsMapped.map(d => d.x),
  ].filter((v): v is number => typeof v === 'number')
  const allYValues = [
    ...bandY,
    ...chartData.map(d => d.y),
    ...chartData.flatMap(d => d.uncertaintyY), // Include uncertainty bounds
    ...dataPointsMapped.map(d => d.y),
  ].filter((v): v is number => typeof v === 'number')

  // fitToFront fits the chart tightly to the front line itself, excluding
  // the uncertainty bands. The bands still render but may extend past the
  // axes — that's the trade-off for a readable front.
  const frontXValues = chartData
    .map(d => d.x)
    .filter((v): v is number => typeof v === 'number')
  const frontYValues = chartData.map(d => d.y)

  const xValues = fitToFront ? frontXValues : allXValues
  const yValues = fitToFront ? frontYValues : allYValues

  // Quality and cost are both non-negative by definition. Clamp the lower
  // bound of each axis to 0 so the uncertainty band extending into negative
  // territory doesn't stretch the visible region away from real data.
  const xMin = Math.max(0, Math.min(...xValues))
  const xMax = Math.max(...xValues)
  const xRange = xMax - xMin
  const xPadding = xRange * 0.05

  const yMin = Math.max(0, Math.min(...yValues))
  const yMax = Math.max(...yValues)
  const yRange = yMax - yMin
  const yPadding = yRange * 0.02

  const xDomain = [Math.max(0, xMin - xPadding), xMax + xPadding]
  const yDomain = [Math.max(0, yMin - yPadding), yMax + yPadding]

  // Format axis values to 2 decimal places
  const formatTick = (value: number) => value.toFixed(2)

  // Narrow the computed domains to fixed-length tuples for the overlay props.
  // Both are derived from data via Math.min/Math.max, so they are defined.
  const xDomainT: [number, number] = [xDomain[0]!, xDomain[1]!]
  const yDomainT: [number, number] = [yDomain[0]!, yDomain[1]!]

  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  return (
    <div
      className={classes.container}
      style={{
        position: 'relative',
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          width={600}
          height={400}
          data={chartData}
          margin={{ top: 32, right: 16, bottom: 10, left: 4 }}
        >
          <XAxis
            type="number"
            dataKey="x"
            tick={{ fontSize: 12 }}
            domain={xDomain}
            allowDataOverflow={fitToFront}
            tickFormatter={formatTick}
            label={{ value: 'Quality', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            type="number"
            domain={yDomain}
            allowDataOverflow={fitToFront}
            tick={{ fontSize: 12 }}
            tickFormatter={formatTick}
            label={{ value: 'Cost', angle: -90, position: 'insideLeft' }}
          />
          {/* Uncertainty visualization — switches with visualizationMode */}
          {visualizationMode === 'band' && (
            <>
              <Customized
                component={() => (
                  <QualityUncertaintyBand
                    xLowerBoundData={xLowerBoundData}
                    xUpperBoundData={xUpperBoundData}
                    xDomain={xDomainT}
                    yDomain={yDomainT}
                  />
                )}
              />
              <Area
                type="monotone"
                dataKey="uncertaintyY"
                fill="#f6c47e"
                fillOpacity={0.3}
                stroke="none"
                name="UncertaintyY"
                isAnimationActive={false}
              />
            </>
          )}
          {visualizationMode === 'ellipses' && (
            <Customized
              component={() => (
                <ConfidenceEllipses
                  ellipseIndices={ellipseIndices}
                  frontYData={plot.front_y_data}
                  obj1Error={plot.obj1_error}
                  obj2Error={plot.obj2_error}
                  xDomain={xDomainT}
                  yDomain={yDomainT}
                />
              )}
            />
          )}
          <Scatter
            name="Dominated observations"
            dataKey={'y'}
            data={observedDominated}
            fill="white"
            stroke="#999"
            strokeWidth={1.5}
            isAnimationActive={false}
            label={{
              position: 'top',
              content: makePointLabel({
                fill: 'white',
                stroke: '#bbb',
                textFill: '#888',
              }),
            }}
          />
          <Scatter
            name="Pareto-optimal observations"
            dataKey={'y'}
            data={observedParetoOptimal}
            fill="#2b5879"
            stroke="#2b5879"
            isAnimationActive={false}
            label={{
              position: 'top',
              content: makePointLabel({
                fill: '#2b5879',
                stroke: '#2b5879',
                textFill: 'white',
              }),
            }}
          />
          <Line
            type="linear"
            dataKey="y"
            stroke="black"
            strokeWidth={2}
            dot={{ r: 2, stroke: 'none', fill: 'black' }}
            name="Pareto front"
            isAnimationActive={false}
          ></Line>
          {/* Reference lines from selected point to axes */}
          <ReferenceLine
            segment={[
              { x: selected[0], y: selected[1] },
              { x: selected[0], y: yDomain[0] },
            ]}
            stroke={'#077ace'}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <ReferenceLine
            segment={[
              { x: selected[0], y: selected[1] },
              { x: xDomain[0], y: selected[1] },
            ]}
            stroke="#077ace"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <Scatter
            name="Selected"
            dataKey={'y'}
            data={[{ x: selected[0], y: selected[1] }]}
            fill="#077ace"
            isAnimationActive={false}
          />
          <Customized
            component={() => (
              <HoverOverlay
                hoverIndex={hoverIndex}
                setHoverIndex={setHoverIndex}
                onSelectIndex={onSelectIndex}
                frontYData={plot.front_y_data}
                frontXData={plot.front_x_data}
                variableNames={variableNames}
                xDomain={xDomainT}
                yDomain={yDomainT}
              />
            )}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className={classes.tooltipContainer}>
        <div
          className={classes.tooltip}
          style={
            styles?.legendBorderColor
              ? { borderColor: styles.legendBorderColor }
              : undefined
          }
        >
          {selected[0] !== undefined && selected[1] !== undefined ? (
            <>
              <div>
                <strong>{selectedLabel}</strong>
              </div>
              {variablesAtSelected?.map((v, i) => (
                <div key={i} className={classes.selectedPointVariable}>
                  {variableNames[i]
                    ? `${variableNames[i]}: ${typeof v === 'number' ? v.toFixed(4) : v}`
                    : `Variable ${i + 1}: ${typeof v === 'number' ? v.toFixed(4) : v}`}
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
              style={{ background: '#077ace' }}
            />
            <span>Selected point</span>
          </div>
          <div className={classes.legendItem}>
            <div
              className={classes.legendColorCircle}
              style={{ background: '#2b5879' }}
            />
            <span>Pareto-optimal observation</span>
          </div>
          <div className={classes.legendItem}>
            <div
              className={classes.legendColorCircle}
              style={{
                background: 'white',
                border: '1.5px solid #999',
                boxSizing: 'border-box',
              }}
            />
            <span>Dominated observation</span>
          </div>
          <div className={classes.legendItem}>
            <div
              className={classes.legendColorLine}
              style={{ background: 'black' }}
            />
            <span>Pareto front</span>
          </div>
          {visualizationMode === 'ellipses' && (
            <div className={classes.legendItem}>
              <div
                className={classes.legendColorCircle}
                style={{
                  background: 'rgba(7, 122, 206, 0.08)',
                  border: '1px solid rgba(7, 122, 206, 0.5)',
                  boxSizing: 'border-box',
                }}
              />
              <span>95% credible region</span>
            </div>
          )}
          {visualizationMode === 'band' && (
            <>
              <div className={classes.legendItem}>
                <div
                  className={classes.legendColor}
                  style={{ background: 'rgba(246, 196, 126, 0.6)' }}
                />
                <span>Uncertainty (cost)</span>
              </div>
              <div className={classes.legendItem}>
                <div
                  className={classes.legendColor}
                  style={{ background: 'rgba(144, 194, 144, 0.6)' }}
                />
                <span>Uncertainty (quality)</span>
              </div>
            </>
          )}
        </div>
        {(renderControls || visualizationModeSelector) && (
          <div className={classes.buttonColumn}>
            {visualizationModeSelector}
            {renderControls?.({
              onToggleFitToFront: () => setFitToFront(f => !f),
              onResetToDefault: () => onResetToDefault?.(),
            })}
          </div>
        )}
      </div>
    </div>
  )
}
