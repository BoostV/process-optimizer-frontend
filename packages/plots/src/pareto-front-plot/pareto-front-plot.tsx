import { ReactNode, useState } from 'react'
import {
  Area,
  Customized,
  Scatter,
  XAxis,
  YAxis,
  ComposedChart,
  Line,
  ReferenceLine,
  ZIndexLayer,
} from 'recharts'
import {
  displayQuality,
  type DataEntry,
  type ParetoPlot,
} from '@boostv/process-optimizer-frontend-core'
import useStyles from './pareto-front-plot.style'
import { makePointLabel } from './point-label'
import { QualityUncertaintyBand } from './overlays/uncertainty-band'
import { HoverOverlay } from './hover-overlay'
import { useElementSize } from '../use-element-size'
import { usePlotColors } from '../colors'

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
  // Show a 95% confidence ellipse for the hovered front point. Defaults to
  // false so consumers opt in explicitly.
  showHoverEllipse?: boolean
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
  showHoverEllipse = false,
  styles,
}: Props) {
  const { classes } = useStyles()
  const plotColors = usePlotColors()
  const [fitToFront, setFitToFront] = useState(false)

  // Size the chart explicitly from the measured chart area instead of using
  // Recharts' ResponsiveContainer (which logs "width(-1) and height(-1)" while
  // the surrounding app's layout settles). See useElementSize.
  const [chartAreaRef, chartSize] = useElementSize<HTMLDivElement>()

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
  const selectedLabel = isBest
    ? 'Target — default point'
    : 'Target — selected point'

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

  // Band overlays always render now, so their bounds always inform the domain.
  const bandX = [
    ...xLowerBoundData.map(d => d.x),
    ...xUpperBoundData.map(d => d.x),
  ]
  const bandY = [
    ...xLowerBoundData.map(d => d.y),
    ...xUpperBoundData.map(d => d.y),
  ]
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

  // X (quality) spans the actual data range with padding and is NOT floored at
  // 0: quality can be stored negated for "maximize" objectives (e.g. the
  // catapult "shoot far" sample). Flooring it produced a degenerate, inverted
  // domain that detached the front from the observed points.
  const xMin = Math.min(...xValues)
  const xMax = Math.max(...xValues)
  const xRange = xMax - xMin
  const xPadding = xRange * 0.05

  // Y (cost) keeps a 0 floor: cost is non-negative by nature, and the cost
  // uncertainty band (front_cost - obj2_error) can dip below 0 as a model
  // artifact — clamp so the axis never shows meaningless negative cost.
  const yMin = Math.max(0, Math.min(...yValues))
  const yMax = Math.max(...yValues)
  const yRange = yMax - yMin
  const yPadding = yRange * 0.02

  const xDomain = [xMin - xPadding, xMax + xPadding]
  const yDomain = [Math.max(0, yMin - yPadding), yMax + yPadding]

  // Format axis values to 2 decimal places
  const formatTick = (value: number) => value.toFixed(2)

  return (
    <div
      className={classes.container}
      data-testid="pareto-front-plot"
      style={{
        position: 'relative',
      }}
    >
      <div
        ref={chartAreaRef}
        style={{ flexGrow: 1, flexBasis: 0, minWidth: 0, height: '100%' }}
      >
        {chartSize.width > 0 && chartSize.height > 0 && (
          <ComposedChart
            width={chartSize.width}
            height={chartSize.height}
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
            {/* Uncertainty band — always shown */}
            <Customized
              component={() => (
                <QualityUncertaintyBand
                  xLowerBoundData={xLowerBoundData}
                  xUpperBoundData={xUpperBoundData}
                />
              )}
            />
            <Area
              type="monotone"
              dataKey="uncertaintyY"
              fill={plotColors.cost}
              fillOpacity={1}
              stroke="none"
              name="UncertaintyY"
              isAnimationActive={false}
              // The custom HoverOverlay is the hover indicator; disable Recharts'
              // own active dots (the range Area leaves an orange dot at each
              // bound, which gets stranded on a fast pointer exit).
              activeDot={false}
            />
            <Scatter
              name="Dominated observations"
              dataKey={'y'}
              data={observedDominated}
              fill="white"
              stroke={plotColors.dominated}
              strokeWidth={1.5}
              isAnimationActive={false}
              label={{
                position: 'top',
                content: makePointLabel(
                  {
                    fill: 'white',
                    stroke: '#bbb',
                    textFill: '#888',
                  },
                  observedDominated
                ),
              }}
            />
            <Scatter
              name="Pareto-optimal observations"
              dataKey={'y'}
              data={observedParetoOptimal}
              fill={plotColors.paretoOptimal}
              stroke={plotColors.paretoOptimal}
              isAnimationActive={false}
              label={{
                position: 'top',
                content: makePointLabel(
                  {
                    fill: plotColors.paretoOptimal,
                    stroke: plotColors.paretoOptimal,
                    textFill: 'white',
                  },
                  observedParetoOptimal
                ),
              }}
            />
            <Line
              type="linear"
              dataKey="y"
              stroke={plotColors.front}
              strokeWidth={2}
              dot={{ r: 2, stroke: 'none', fill: plotColors.front }}
              name="Pareto front"
              isAnimationActive={false}
              activeDot={false}
            ></Line>
            {/* Reference lines from selected point to axes */}
            <ReferenceLine
              segment={[
                { x: selected[0], y: selected[1] },
                { x: selected[0], y: yDomain[0] },
              ]}
              stroke={plotColors.selectedPoint}
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <ReferenceLine
              segment={[
                { x: selected[0], y: selected[1] },
                { x: xDomain[0], y: selected[1] },
              ]}
              stroke={plotColors.selectedPoint}
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <Scatter
              name="Selected"
              dataKey={'y'}
              data={[{ x: selected[0], y: selected[1] }]}
              fill={plotColors.selectedPoint}
              isAnimationActive={false}
            />
            {/*
            Render the hover overlay on a high zIndex layer so its transparent
            interaction rect sits ON TOP of the data series. A plain <Customized>
            renders at z≈0 — behind the uncertainty Area (z 100), Line (400) and
            its dots/Scatter (600) — so those painted series swallowed pointer
            events and hover only activated in the empty space above the front.
            See Recharts DefaultZIndexes.
          */}
            <ZIndexLayer zIndex={1500}>
              <HoverOverlay
                onSelectIndex={onSelectIndex}
                frontYData={plot.front_y_data}
                frontXData={plot.front_x_data}
                variableNames={variableNames}
                showHoverEllipse={showHoverEllipse}
                obj1Error={plot.obj1_error}
                obj2Error={plot.obj2_error}
              />
            </ZIndexLayer>
          </ComposedChart>
        )}
      </div>
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
              style={{ background: plotColors.selectedPoint }}
            />
            <span>Selected point</span>
          </div>
          <div className={classes.legendItem}>
            <div
              className={classes.legendColorCircle}
              style={{ background: plotColors.paretoOptimal }}
            />
            <span>Pareto-optimal observation</span>
          </div>
          <div className={classes.legendItem}>
            <div
              className={classes.legendColorCircle}
              style={{
                background: 'white',
                border: `1.5px solid ${plotColors.dominated}`,
                boxSizing: 'border-box',
              }}
            />
            <span>Dominated observation</span>
          </div>
          <div className={classes.legendItem}>
            <div
              className={classes.legendColorLine}
              style={{ background: plotColors.front }}
            />
            <span>Pareto front</span>
          </div>
          <div className={classes.legendItem}>
            <div
              className={classes.legendColor}
              style={{ background: plotColors.cost }}
            />
            <span>Uncertainty (cost)</span>
          </div>
          <div className={classes.legendItem}>
            <div
              className={classes.legendColor}
              style={{ background: plotColors.quality }}
            />
            <span>Uncertainty (quality)</span>
          </div>
          {showHoverEllipse && (
            <div className={classes.legendItem}>
              <div
                className={classes.legendColorCircle}
                style={{
                  background: 'rgba(7, 122, 206, 0.08)',
                  border: '1px solid rgba(7, 122, 206, 0.5)',
                  boxSizing: 'border-box',
                }}
              />
              <span>95% credible region (hover a point)</span>
            </div>
          )}
        </div>
        {renderControls && (
          <div className={classes.buttonColumn}>
            {renderControls({
              onToggleFitToFront: () => setFitToFront(f => !f),
              onResetToDefault: () => onResetToDefault?.(),
            })}
          </div>
        )}
      </div>
    </div>
  )
}
