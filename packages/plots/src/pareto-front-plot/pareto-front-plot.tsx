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
import { alpha, darken } from '@mui/material/styles'
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
  // Override the default chart box (600x840). Useful for embedding the plot at
  // a smaller size, e.g. in the help dialog.
  width?: number | string
  maxWidth?: number | string
  height?: number | string
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
  // Hide the side legend / selected-point panel (e.g. for compact thumbnails
  // where the legend would be redundant). Defaults to false.
  hideLegend?: boolean
  styles?: {
    legendBorderColor?: string
  }
}

export default function ParetoFrontPlot({
  indexOfSelected,
  plot,
  width,
  maxWidth,
  height,
  dataPoints,
  onSelectIndex,
  onResetToDefault,
  renderControls,
  showHoverEllipse = false,
  hideLegend = false,
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

  // Observed points with their input settings (aligned to variableNames), for
  // the hover pop-up shown when the pointer enters a numbered "#id" rectangle.
  // x is observed quality in display units (already positive — unlike the
  // model front, observed scores are stored as shown), y is observed cost.
  const observedPoints = dataPointsMapped.map((p, i) => ({
    id: p.id,
    x: p.x,
    y: p.y,
    settings:
      dataPoints[i]?.data.filter(d => d.type !== 'score').map(d => d.value) ??
      [],
  }))

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

  // X (quality) is floored at 0, mirroring the cost axis: the quality
  // uncertainty band can dip below 0 as a model artifact and surface a
  // meaningless negative quality on the axis. Product decision: clamp at 0 for
  // all objectives. Trade-off — for "maximize" objectives whose displayed
  // quality is genuinely negative (e.g. the catapult "shoot far" sample), the
  // sub-zero region is clipped.
  const xMin = Math.max(0, Math.min(...xValues))
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

  const xDomainMin = Math.max(0, xMin - xPadding)
  const xDomainMax = xMax + xPadding
  const yDomainMin = Math.max(0, yMin - yPadding)
  const yDomainMax = yMax + yPadding
  const xDomain = [xDomainMin, xDomainMax]
  const yDomain = [yDomainMin, yDomainMax]

  // Format axis values to 2 decimal places
  const formatTick = (value: number) => value.toFixed(2)

  return (
    <div
      className={classes.container}
      data-testid="pareto-front-plot"
      style={{
        position: 'relative',
        ...(width !== undefined ? { width } : {}),
        ...(maxWidth !== undefined ? { maxWidth } : {}),
        ...(height !== undefined ? { height } : {}),
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
              // Always clip to the domain so the 0 floor in `xDomain` holds —
              // same reasoning as the cost axis below.
              allowDataOverflow={true}
              tickFormatter={formatTick}
              label={{ value: 'Quality', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              type="number"
              domain={yDomain}
              // Always clip to the domain so the 0 floor in `yDomain` holds.
              // With allowDataOverflow=false, Recharts auto-expands the axis to
              // fit the cost uncertainty band, whose lower bound
              // (cost - obj2_error) can dip below 0 — surfacing a meaningless
              // negative cost (e.g. -0.04 on the cfps sample). yDomainMax still
              // includes the band's upper bound, so only the sub-zero tail is cut.
              allowDataOverflow={true}
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
            {/* Cost band is painted on top of the quality band, so it must be
                translucent or it hides the quality band wherever cost is wider
                (which swaps along the front — z-order alone can't fix it). Its
                translucency now comes from the theme color's alpha channel
                (pareto.costBand) — keep an alpha there. A deeper-sand stroke
                forced to full alpha keeps the band's edge crisp despite the
                soft fill. */}
            <Area
              type="monotone"
              dataKey="uncertaintyY"
              fill={plotColors.pareto.costBand}
              stroke={alpha(darken(plotColors.pareto.costBand, 0.25), 1)}
              strokeWidth={1}
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
              stroke={plotColors.pareto.dominated}
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
              fill={plotColors.pareto.optimal}
              stroke={plotColors.pareto.optimal}
              isAnimationActive={false}
              label={{
                position: 'top',
                content: makePointLabel(
                  {
                    fill: plotColors.pareto.optimal,
                    stroke: plotColors.pareto.optimal,
                    textFill: 'white',
                  },
                  observedParetoOptimal
                ),
              }}
            />
            <Line
              type="linear"
              dataKey="y"
              stroke={plotColors.pareto.front}
              strokeWidth={2}
              dot={{ r: 2, stroke: 'none', fill: plotColors.pareto.front }}
              name="Pareto front"
              isAnimationActive={false}
              activeDot={false}
            ></Line>
            {/* Reference lines from the selected point to the axes. They must
                sit ABOVE every data series (uncertainty Area z=100, front Line
                z=400, observation/front dots z=600) — at the default
                ReferenceLine z-index (400) the front's points and dots paint
                over the lower part of the vertical guide, so it visually
                "stops" at the front instead of reaching the axis. A high
                zIndex keeps both guides on top and fully visible down to the
                axes, while staying below the point labels (2000) and the hover
                overlay (2100). */}
            {/* Extend the far ends well past the domain and clip to the plot
                area (ifOverflow="hidden"): the uncertainty bands are Areas with
                allowDataOverflow=false, so Recharts expands the rendered axes
                below/left of yDomain[0]/xDomain[0]. Ending the segment exactly
                at those values left the vertical guide hanging at the bottom of
                the front instead of reaching the axis. Clipping pins each guide
                to the real axis regardless of how far the band expanded it. */}
            <ReferenceLine
              segment={[
                { x: selected[0], y: selected[1] },
                {
                  x: selected[0],
                  y: yDomainMin - (yDomainMax - yDomainMin) * 10,
                },
              ]}
              ifOverflow="hidden"
              stroke={plotColors.pareto.guide}
              strokeWidth={1}
              strokeDasharray="3 3"
              zIndex={1300}
            />
            <ReferenceLine
              segment={[
                { x: selected[0], y: selected[1] },
                {
                  x: xDomainMin - (xDomainMax - xDomainMin) * 10,
                  y: selected[1],
                },
              ]}
              ifOverflow="hidden"
              stroke={plotColors.pareto.guide}
              strokeWidth={1}
              strokeDasharray="3 3"
              zIndex={1300}
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
            The layer is also ABOVE the point-indicator labels (Recharts label
            layer, z 2000) so the hover tooltip box paints on top of the "#id"
            indicators instead of being hidden behind them. See Recharts
            DefaultZIndexes.
          */}
            <ZIndexLayer zIndex={2100}>
              <HoverOverlay
                onSelectIndex={onSelectIndex}
                frontYData={plot.front_y_data}
                frontXData={plot.front_x_data}
                variableNames={variableNames}
                showHoverEllipse={showHoverEllipse}
                obj1Error={plot.obj1_error}
                obj2Error={plot.obj2_error}
                observedPoints={observedPoints}
              />
            </ZIndexLayer>
          </ComposedChart>
        )}
      </div>
      {!hideLegend && (
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
                <div className={classes.selectedPointVariable}>
                  {`Quality ≈ ${selected[0]?.toFixed(2) ?? '?'}, Cost ≈ ${
                    selected[1]?.toFixed(2) ?? '?'
                  }`}
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
                style={{ background: plotColors.pareto.optimal }}
              />
              <span>Pareto-optimal observation</span>
            </div>
            <div className={classes.legendItem}>
              <div
                className={classes.legendColorCircle}
                style={{
                  background: 'white',
                  border: `1.5px solid ${plotColors.pareto.dominated}`,
                  boxSizing: 'border-box',
                }}
              />
              <span>Dominated observation</span>
            </div>
            <div className={classes.legendItem}>
              <div
                className={classes.legendColorLine}
                style={{ background: plotColors.pareto.front }}
              />
              <span>Pareto front</span>
            </div>
            <div className={classes.legendItem}>
              <div
                className={classes.legendColor}
                style={{ background: plotColors.pareto.costBand }}
              />
              <span>Uncertainty (cost)</span>
            </div>
            <div className={classes.legendItem}>
              <div
                className={classes.legendColor}
                style={{ background: plotColors.pareto.qualityBand }}
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
      )}
    </div>
  )
}
