import { ReactElement } from 'react'

type LabelColors = { fill: string; stroke: string; textFill: string }
type LabeledPoint = { id: number | string }

// Factory for the Scatter `label.content` SVG builder. The two pareto scatter
// series differ only by color, so this replaces both duplicated label blocks.
//
// Recharts v3 no longer spreads the data point's custom fields into the label
// content props (it passes x/y/value/index/… but not our `id`). So we look the
// id up by the per-series `index` from the scatter data we're given.
export const makePointLabel =
  ({ fill, stroke, textFill }: LabelColors, points: readonly LabeledPoint[]) =>
  // This is a Recharts `label.content` render callback, not a React component.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, react/display-name
  (props: any): ReactElement | null => {
    const { x, y, index } = props
    const id = points[index]?.id
    if (id === undefined || id === null) {
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
          fill={fill}
          stroke={stroke}
          strokeWidth={1}
          rx={2}
        />
        <text
          x={x}
          y={rectY + height / 2}
          fill={textFill}
          fontSize={fontSize}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {text}
        </text>
      </g>
    )
  }
