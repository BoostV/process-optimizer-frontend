import { describe, expect, it } from 'vitest'
import { experimentReducer } from './experiment-reducers'
import { initialState } from './store'
import { produce } from 'immer'

describe('experimentReducer pareto selection invalidation', () => {
  const withSelection = produce(initialState.experiment, draft => {
    draft.extras.selectedPoint = [1, 2, 'Red']
  })

  it('clears selectedPoint when a structural action changes a structural field', () => {
    // updateDataPoints mutates state.dataPoints — a structural key
    const next = experimentReducer(withSelection, {
      type: 'updateDataPoints',
      payload: [],
    })
    expect('selectedPoint' in next.extras).toBe(false)
  })

  it('keeps selectedPoint when setSelectedParetoPoint sets it', () => {
    const next = experimentReducer(initialState.experiment, {
      type: 'setSelectedParetoPoint',
      payload: [1, 2, 'Red'],
    })
    expect(next.extras.selectedPoint).toEqual([1, 2, 'Red'])
  })

  it('keeps selectedPoint across a non-structural action', () => {
    // updateExperimentName only mutates state.info.name — no structural field touched
    const next = experimentReducer(withSelection, {
      type: 'updateExperimentName',
      payload: 'New Name',
    })
    expect(next.extras.selectedPoint).toEqual([1, 2, 'Red'])
  })
})
