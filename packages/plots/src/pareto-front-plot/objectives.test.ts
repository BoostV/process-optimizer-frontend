import { describe, expect, it } from 'vitest'
import {
  defaultObjectives,
  isParetoOptimal,
  objectiveLegendName,
  toDisplayFront,
  ObjectiveDisplay,
} from './objectives'

const points = [
  { x: 1, y: 1 },
  { x: 2, y: 2 },
  { x: 3, y: 1 },
]
const optimal = (objectives: [ObjectiveDisplay, ObjectiveDisplay]) =>
  points.filter(p => isParetoOptimal(p, points, objectives))

describe('isParetoOptimal', () => {
  it('defaults: maximize x (quality), minimize y (cost)', () => {
    expect(optimal(defaultObjectives)).toEqual([{ x: 3, y: 1 }])
  })
  it('both minimized', () => {
    expect(
      optimal([
        { label: 'A', maximize: false },
        { label: 'B', maximize: false },
      ])
    ).toEqual([{ x: 1, y: 1 }])
  })
  it('both maximized', () => {
    expect(
      optimal([
        { label: 'A', maximize: true },
        { label: 'B', maximize: true },
      ])
    ).toEqual([
      { x: 2, y: 2 },
      { x: 3, y: 1 },
    ])
  })
  it('minimize x, maximize y', () => {
    expect(
      optimal([
        { label: 'A', maximize: false },
        { label: 'B', maximize: true },
      ])
    ).toEqual([
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ])
  })
})

describe('toDisplayFront', () => {
  const front: [number, number][] = [[-4, 2]]
  it('defaults: flips the first objective only', () => {
    expect(toDisplayFront(front, defaultObjectives)).toEqual([[4, 2]])
  })
  it('flips each maximized objective', () => {
    expect(
      toDisplayFront(front, [
        { label: 'A', maximize: false },
        { label: 'B', maximize: true },
      ])
    ).toEqual([[-4, -2]])
  })
})

describe('objectiveLegendName', () => {
  it('lower-cases the default names, as before', () => {
    expect(objectiveLegendName(defaultObjectives[0], 0)).toBe('quality')
    expect(objectiveLegendName(defaultObjectives[1], 1)).toBe('cost')
  })
  it("keeps the user's own name as written", () => {
    expect(objectiveLegendName({ label: 'Yield', maximize: true }, 0)).toBe(
      'Yield'
    )
  })
})
