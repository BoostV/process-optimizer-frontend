import { usePlotArea } from 'recharts'

export type PixelProjector = {
  xToPx: (x: number) => number
  yToPx: (y: number) => number
  plotArea: NonNullable<ReturnType<typeof usePlotArea>>
} | null

// Maps data coordinates to pixel coordinates within the Recharts plot area.
// Returns null until the plot area has non-zero size.
export const useDataToPixel = (
  xDomain: [number, number],
  yDomain: [number, number]
): PixelProjector => {
  const plotArea = usePlotArea()
  if (!plotArea || plotArea.width === 0 || plotArea.height === 0) {
    return null
  }
  const xToPx = (x: number) =>
    plotArea.x + ((x - xDomain[0]) / (xDomain[1] - xDomain[0])) * plotArea.width
  const yToPx = (y: number) =>
    plotArea.y +
    (1 - (y - yDomain[0]) / (yDomain[1] - yDomain[0])) * plotArea.height
  return { xToPx, yToPx, plotArea }
}
