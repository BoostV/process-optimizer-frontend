import { displayScore } from '@boostv/process-optimizer-frontend-core'

// How one objective (axis) of the pareto plot is shown: its name, and whether
// higher (maximize) or lower values are better.
export type ObjectiveDisplay = { label: string; maximize: boolean }

// First objective on the x axis, second on the y axis.
export const defaultObjectives: [ObjectiveDisplay, ObjectiveDisplay] = [
  { label: 'Quality', maximize: true },
  { label: 'Cost', maximize: false },
]

const atLeastAsGood = (a: number, b: number, maximize: boolean) =>
  maximize ? a >= b : a <= b
const better = (a: number, b: number, maximize: boolean) =>
  maximize ? a > b : a < b

// A point is pareto-optimal when no other point is at least as good on both
// objectives and strictly better on one.
export const isParetoOptimal = (
  p: { x: number; y: number },
  all: { x: number; y: number }[],
  objectives: [ObjectiveDisplay, ObjectiveDisplay]
): boolean => {
  const [ox, oy] = objectives
  return !all.some(
    o =>
      o !== p &&
      atLeastAsGood(o.x, p.x, ox.maximize) &&
      atLeastAsGood(o.y, p.y, oy.maximize) &&
      (better(o.x, p.x, ox.maximize) || better(o.y, p.y, oy.maximize))
  )
}

// The optimizer minimizes, so a maximized objective comes back negated. Convert
// the model front from optimizer units to the units the user entered.
export const toDisplayFront = (
  front: [number, number][],
  objectives: [ObjectiveDisplay, ObjectiveDisplay]
): [number, number][] =>
  front.map(([a, b]) => [
    displayScore(a, objectives[0].maximize),
    displayScore(b, objectives[1].maximize),
  ])

// Name used inside running text such as "Uncertainty (quality)": the default
// names are lower-cased as before, a user's own name is kept as written.
export const objectiveLegendName = (
  objective: ObjectiveDisplay,
  index: 0 | 1
): string =>
  objective.label === defaultObjectives[index].label
    ? objective.label.toLowerCase()
    : objective.label
