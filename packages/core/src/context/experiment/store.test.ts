import { describe, expect, it } from 'vitest'
import { initialState, initialStateMultiObjective } from './store'

describe('initial state score defaults', () => {
  it('single objective: quality is maximized', () => {
    expect(initialState.experiment.scoreVariables).toMatchObject([
      { name: 'quality', label: 'Quality (0-5)', maximize: true },
    ])
  })

  it('multi objective: quality is maximized, cost is minimized', () => {
    expect(initialStateMultiObjective.experiment.scoreVariables).toMatchObject([
      { name: 'quality', label: 'Quality (0-5)', maximize: true },
      { name: 'cost', label: 'Cost', maximize: false },
    ])
  })
})
