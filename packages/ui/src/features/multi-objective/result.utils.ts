import {
  displayScoreCI,
  ScoreVariableType,
} from '@boostv/process-optimizer-frontend-core'
import { OneDData } from '@boostv/process-optimizer-frontend-plots'
import {
  costDisplayDomain,
  flipScores,
  qualityDisplayDomain,
} from '../../containers/result-data/experimentation-guide.utils'

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

type ObjectiveScore = Pick<ScoreVariableType, 'name' | 'maximize'>

// Prepare one objective's 1D plots for display.
// - A maximized score is minimized as its negation, so its json plots come
//   back negated: flip them back to display units. A minimized score is shown
//   as returned.
// - Pin every plot of the objective to one shared scale so the per-factor Y
//   axes and the histogram X axis line up, and tag the plots with the
//   objective so they are themed per objective. Scale and colour follow the
//   score's slot (first/second score), not its direction or label.
export const objectivePlotData = (
  plots: (string | OneDData)[],
  score: ObjectiveScore | undefined
): (string | OneDData)[] => {
  if (score === undefined) {
    return plots
  }
  const displayPlots = score.maximize
    ? plots.map(p => (typeof p === 'string' ? p : flipScores(p)))
    : plots
  const domain =
    score.name === 'quality'
      ? qualityDisplayDomain(displayPlots)
      : costDisplayDomain(displayPlots)
  return displayPlots.map(p => {
    if (typeof p === 'string') {
      return p
    }
    return p.type === 'score'
      ? { ...p, objective: score.name, xDomain: domain }
      : { ...p, objective: score.name, yDomain: domain }
  })
}

// 95% interval of one objective at the selected pareto point, in display
// units. `index` is the objective's position (0 or 1) on the front.
export const selectedPointCI = (
  index: number,
  maximize: boolean,
  pareto: {
    front_y_data: [number, number][]
    obj1_error: number[]
    obj2_error: number[]
  },
  selectedIndex: number
): string => {
  const value = pareto.front_y_data[selectedIndex]?.[index === 0 ? 0 : 1] ?? 0
  const errors = index === 0 ? pareto.obj1_error : pareto.obj2_error
  return displayScoreCI(value, errors[selectedIndex] ?? 0, maximize)
}
