import {
  cloneElement,
  isValidElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  Customized,
  Scatter,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ComposedChart,
  Line,
  ReferenceLine,
  usePlotArea,
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
  onSelectIndex?: (index: number) => void
  fitToFrontButton?: ReactNode
  resetToDefaultButton?: ReactNode
  onResetToDefault?: () => void
  styles?: {
    legendBorderColor?: string
  }
}

const defaultFitBtn = <button>Toggle to fit front</button>
const defaultResetBtn = <button>Reset to default</button>

export default function ParetoFrontPlot({
  indexOfSelected,
  plot,
  dataPoints,
  onSelectIndex,
  fitToFrontButton = defaultFitBtn,
  resetToDefaultButton = defaultResetBtn,
  onResetToDefault,
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
  // so for display we flip quality but leave cost alone.
  const displayQuality = (q: number) => -q

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
    x:
      displayQuality(yPair[0]) -
      (Array.isArray(plot.obj1_error[i])
        ? plot.obj1_error[i][0]
        : plot.obj1_error[i] || 0),
    y: yPair[1],
  }))

  const xUpperBoundData = plot.front_y_data.map((yPair, i) => ({
    x:
      displayQuality(yPair[0]) +
      (Array.isArray(plot.obj1_error[i])
        ? plot.obj1_error[i][0]
        : plot.obj1_error[i] || 0),
    y: yPair[1],
  }))

  // Sample ~10 front points to draw 95% confidence ellipses at. Each ellipse's
  // semi-axes are the per-objective 1.96-sigma errors at that point, so the
  // shape communicates joint uncertainty along the front without the continuous
  // band overpowering the rest of the chart.
  const ELLIPSE_COUNT = 10
  const scalarError = (e: number | number[] | undefined): number =>
    Array.isArray(e) ? Number(e[0] ?? 0) : Number(e ?? 0)
  const frontLen = plot.front_y_data.length
  const ellipseIndices =
    frontLen <= ELLIPSE_COUNT
      ? plot.front_y_data.map((_, i) => i)
      : Array.from({ length: ELLIPSE_COUNT }, (_, k) =>
          Math.round((k * (frontLen - 1)) / (ELLIPSE_COUNT - 1))
        )

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
  const xPadding = xRange * 0.02

  const yMin = Math.max(0, Math.min(...yValues))
  const yMax = Math.max(...yValues)
  const yRange = yMax - yMin
  const yPadding = yRange * 0.02

  const xDomain = [Math.max(0, xMin - xPadding), xMax + xPadding]
  const yDomain = [Math.max(0, yMin - yPadding), yMax + yPadding]

  // Format axis values to 2 decimal places
  const formatTick = (value: number) => value.toFixed(2)

  // Renders sampled 95% confidence ellipses along the front. Defined inside
  // ParetoFrontPlot so it can close over `plot`, `ellipseIndices`, and the
  // domain. Recharts <Customized> wraps the return in a <Layer> (an SVG <g>),
  // so we render plain SVG <ellipse> elements positioned in pixel space.
  const ConfidenceEllipses = () => {
    const plotArea = usePlotArea()
    if (!plotArea || plotArea.width === 0 || plotArea.height === 0) return null
    const xToPx = (x: number) =>
      plotArea.x +
      ((x - xDomain[0]!) / (xDomain[1]! - xDomain[0]!)) * plotArea.width
    const yToPx = (y: number) =>
      plotArea.y +
      (1 - (y - yDomain[0]!) / (yDomain[1]! - yDomain[0]!)) * plotArea.height
    return (
      <g pointerEvents="none">
        {ellipseIndices.map(i => {
          const yPair = plot.front_y_data[i]
          if (!yPair) return null
          const cxData = displayQuality(yPair[0])
          const cyData = yPair[1]
          const e1 = scalarError(plot.obj1_error[i])
          const e2 = scalarError(plot.obj2_error[i])
          const cx = xToPx(cxData)
          const cy = yToPx(cyData)
          const rx = Math.abs(xToPx(cxData + e1) - cx)
          const ry = Math.abs(yToPx(cyData + e2) - cy)
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill="rgba(7, 122, 206, 0.08)"
              stroke="rgba(7, 122, 206, 0.5)"
              strokeWidth={1}
            />
          )
        })}
      </g>
    )
  }

  // START: AI-generated hover line
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const hoverLineRef = useRef<HTMLDivElement>(null)
  const hoverLabelRef = useRef<HTMLDivElement>(null)
  const hoverDotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const pixelToDataX = (clientX: number): number | null => {
    const container = containerRef.current
    if (!container) {
      return null
    }
    const axisLine = container.querySelector(
      '.recharts-xAxis .recharts-cartesian-axis-line'
    ) as SVGLineElement | null
    const svg = container.querySelector('svg')
    if (!axisLine || !svg) {
      return null
    }
    const svgRect = svg.getBoundingClientRect()
    const x1 = parseFloat(axisLine.getAttribute('x1') || '0')
    const x2 = parseFloat(axisLine.getAttribute('x2') || '0')
    const relX = (clientX - svgRect.left - x1) / (x2 - x1)
    if (relX < 0 || relX > 1) {
      return null
    }
    const dMin = xDomain[0]!
    const dMax = xDomain[1]!
    return dMin + relX * (dMax - dMin)
  }

  const findNearestFrontIndex = (xValue: number) => {
    // xValue is in display units (positive quality); front_y_data[i][0] is in
    // backend units (negated quality). Compare in display units.
    let nearest = 0
    let minDist = Infinity
    for (let i = 0; i < plot.front_y_data.length; i++) {
      const dist = Math.abs(displayQuality(plot.front_y_data[i]![0]) - xValue)
      if (dist < minDist) {
        minDist = dist
        nearest = i
      }
    }
    return nearest
  }

  const showHover = (
    pixelX: number,
    chartTop: number,
    point: [number, number],
    xVars: ReadonlyArray<number | string> | undefined,
    dotPixelX: number,
    dotPixelY: number
  ) => {
    if (hoverLineRef.current) {
      hoverLineRef.current.style.display = 'block'
      hoverLineRef.current.style.left = `${pixelX}px`
      hoverLineRef.current.style.top = `${chartTop}px`
    }
    if (hoverLabelRef.current) {
      const children = hoverLabelRef.current.children
      if (children[0]) {
        children[0].textContent = `Quality: ${displayQuality(point[0]).toFixed(2)}`
      }
      if (children[1]) {
        children[1].textContent = `Cost: ${point[1].toFixed(2)}`
      }
      variableNames.forEach((name, i) => {
        const child = children[i + 2]
        if (!child) return
        const v = xVars?.[i]
        child.textContent =
          v === undefined
            ? ''
            : `${name}: ${typeof v === 'number' ? v.toFixed(4) : v}`
      })
      hoverLabelRef.current.style.display = 'block'
      hoverLabelRef.current.style.left = `${pixelX + 6}px`
      hoverLabelRef.current.style.top = `${chartTop + 4}px`
    }
    if (hoverDotRef.current) {
      hoverDotRef.current.style.display = 'block'
      hoverDotRef.current.style.left = `${dotPixelX}px`
      hoverDotRef.current.style.top = `${dotPixelY}px`
    }
  }

  const hideHover = () => {
    if (hoverLineRef.current) {
      hoverLineRef.current.style.display = 'none'
    }
    if (hoverLabelRef.current) {
      hoverLabelRef.current.style.display = 'none'
    }
    if (hoverDotRef.current) {
      hoverDotRef.current.style.display = 'none'
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX } = e
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const container = containerRef.current
      if (!container) {
        return
      }
      const xValue = pixelToDataX(clientX)
      if (xValue === null) {
        hideHover()
        return
      }
      const idx = findNearestFrontIndex(xValue)
      const point = plot.front_y_data[idx]
      if (!point) {
        hideHover()
        return
      }
      const svg = container.querySelector('svg')
      if (!svg) {
        return
      }
      const svgRect = svg.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const xAxisLine = container.querySelector(
        '.recharts-xAxis .recharts-cartesian-axis-line'
      ) as SVGLineElement | null
      const yAxisLine = container.querySelector(
        '.recharts-yAxis .recharts-cartesian-axis-line'
      ) as SVGLineElement | null
      const xAxisX1 = parseFloat(xAxisLine?.getAttribute('x1') || '0')
      const xAxisX2 = parseFloat(xAxisLine?.getAttribute('x2') || '0')
      const y1 = yAxisLine ? parseFloat(yAxisLine.getAttribute('y1') || '0') : 0
      const y2 = yAxisLine
        ? parseFloat(yAxisLine.getAttribute('y2') || '0')
        : svgRect.height
      const pixelX = clientX - containerRect.left
      const chartTop = svgRect.top - containerRect.top + Math.min(y1, y2)

      // Convert nearest point's data coordinates to pixel coordinates
      const svgOffsetX = svgRect.left - containerRect.left
      const svgOffsetY = svgRect.top - containerRect.top
      const relPointX =
        (displayQuality(point[0]) - xDomain[0]!) / (xDomain[1]! - xDomain[0]!)
      const dotPixelX = svgOffsetX + xAxisX1 + relPointX * (xAxisX2 - xAxisX1)
      const yTop = Math.min(y1, y2)
      const yBottom = Math.max(y1, y2)
      const relPointY = (point[1] - yDomain[0]!) / (yDomain[1]! - yDomain[0]!)
      const dotPixelY = svgOffsetY + yBottom - relPointY * (yBottom - yTop)

      const xVars = plot.front_x_data[idx]
      showHover(pixelX, chartTop, point, xVars, dotPixelX, dotPixelY)
    })
  }

  const handleMouseLeave = () => {
    cancelAnimationFrame(rafRef.current)
    hideHover()
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSelectIndex) {
      return
    }
    const xValue = pixelToDataX(e.clientX)
    if (xValue === null) {
      return
    }
    onSelectIndex(findNearestFrontIndex(xValue))
  }
  // END: AI-generated hover line

  return (
    <div
      className={classes.container}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        position: 'relative',
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          width={600}
          height={400}
          data={chartData}
          margin={{ top: 32, right: 0, bottom: 10, left: 4 }}
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
          {/* Confidence ellipses replace the continuous uncertainty band */}
          <Customized component={ConfidenceEllipses} />
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
                const rectY = y - 5 - height

                return (
                  <g>
                    <rect
                      x={rectX}
                      y={rectY}
                      width={width}
                      height={height}
                      fill="white"
                      stroke="#bbb"
                      strokeWidth={1}
                      rx={2}
                    />
                    <text
                      x={x}
                      y={rectY + height / 2}
                      fill="#888"
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
                const rectY = y - 5 - height

                return (
                  <g>
                    <rect
                      x={rectX}
                      y={rectY}
                      width={width}
                      height={height}
                      fill="#2b5879"
                      stroke="#2b5879"
                      strokeWidth={1}
                      rx={2}
                    />
                    <text
                      x={x}
                      y={rectY + height / 2}
                      fill="white"
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
          />
          <Line
            type="linear"
            dataKey="y"
            stroke="black"
            strokeWidth={2}
            dot={{ r: 2, stroke: 'none', fill: 'black' }}
            name="Pareto front"
            isAnimationActive={false}
            onClick={e => console.log(e)}
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
        </ComposedChart>
      </ResponsiveContainer>
      <div
        ref={hoverLineRef}
        style={{
          display: 'none',
          position: 'absolute',
          width: 0,
          height: '100%',
          borderLeft: '1px dashed rgba(43, 88, 121, 0.4)',
          pointerEvents: 'none',
        }}
      />
      <div
        ref={hoverLabelRef}
        style={{
          display: 'none',
          position: 'absolute',
          color: '#077ace',
          fontSize: 12,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          background: 'rgba(255, 255, 255, 0.85)',
          padding: '2px 6px',
          borderRadius: 3,
        }}
      >
        <div />
        <div />
        {variableNames.map((_, i) => (
          <div key={i} />
        ))}
      </div>
      <div
        ref={hoverDotRef}
        style={{
          display: 'none',
          position: 'absolute',
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: '#077ace',
          border: '2px solid white',
          boxShadow: '0 0 3px rgba(0,0,0,0.3)',
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
        }}
      />
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
        </div>
        {(fitToFrontButton || resetToDefaultButton) && (
          <>
            <div className={classes.buttonColumn}>
              {fitToFrontButton &&
                isValidElement<{ onClick?: () => void }>(fitToFrontButton) &&
                cloneElement(fitToFrontButton, {
                  onClick: () => setFitToFront(f => !f),
                })}
              {resetToDefaultButton &&
                isValidElement<{ onClick?: () => void }>(
                  resetToDefaultButton
                ) &&
                cloneElement(resetToDefaultButton, {
                  onClick: onResetToDefault,
                })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
