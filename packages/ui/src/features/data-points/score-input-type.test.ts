import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  DataEntry,
  ScoreVariableType,
} from '@boostv/process-optimizer-frontend-core'
import { useDataPoints } from './useDataPoints'

const score = (
  name: 'quality' | 'cost',
  maximize: boolean
): ScoreVariableType => ({
  name,
  label: name,
  description: '',
  enabled: true,
  maximize,
})

const points: DataEntry[] = [
  {
    meta: { id: 1, enabled: true, valid: true },
    data: [
      { type: 'score', name: 'quality', value: 3 },
      { type: 'score', name: 'cost', value: 7 },
    ],
  },
]

// Input type of each score column, for an existing row and the "new row".
const scoreTypes = (scores: ScoreVariableType[]) => {
  const { result } = renderHook(() => useDataPoints([], [], scores, points))
  return result.current.state.rows.map(row =>
    row.dataPoints
      .filter(d => d.name === 'quality' || d.name === 'cost')
      .map(d => d.type)
  )
}

describe('score input type', () => {
  it('a maximized first score is a 0-5 star rating (as before)', () => {
    const types = scoreTypes([score('quality', true), score('cost', false)])
    expect(types.length).toBeGreaterThan(1)
    types.forEach(t => expect(t).toEqual(['rating', 'numeric']))
  })

  it('a minimized first score is a plain number: five stars would mean worst', () => {
    const types = scoreTypes([score('quality', false), score('cost', false)])
    expect(types.length).toBeGreaterThan(1)
    types.forEach(t => expect(t).toEqual(['numeric', 'numeric']))
  })

  it('the second score is a plain number whatever its direction', () => {
    const types = scoreTypes([score('quality', true), score('cost', true)])
    types.forEach(t => expect(t).toEqual(['rating', 'numeric']))
  })
})
