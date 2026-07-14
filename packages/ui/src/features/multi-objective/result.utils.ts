export const matchFrontIndex = (
  front: Array<Array<number | string>>,
  target: Array<number | string>
): number => {
  for (let i = 0; i < front.length; i++) {
    const row = front[i]
    if (!row || row.length !== target.length) {
      continue
    }
    let allEqual = true
    for (let j = 0; j < row.length; j++) {
      const a = row[j]
      const b = target[j]
      if (typeof a !== typeof b || a !== b) {
        allEqual = false
        break
      }
    }
    if (allEqual) {
      return i
    }
  }
  return -1
}

export const resolveSelectedIndex = (
  front: Array<Array<number | string>>,
  selectedCoords: Array<number | string> | undefined,
  bestIdx: number
): number => {
  if (!selectedCoords) {
    return bestIdx
  }
  const idx = matchFrontIndex(front, selectedCoords)
  return idx >= 0 ? idx : bestIdx
}
