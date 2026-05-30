import { ReactElement } from 'react'

type LabelColors = { fill: string; stroke: string; textFill: string }

// Factory for the Scatter `label.content` SVG builder. The two pareto scatter
// series differ only by color, so this replaces both duplicated label blocks.
export const makePointLabel =
  ({ fill, stroke, textFill }: LabelColors) =>
  // This is a Recharts `label.content` render callback, not a React component.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, react/display-name
  (props: any): ReactElement | null => {
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
