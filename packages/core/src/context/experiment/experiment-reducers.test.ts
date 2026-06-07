import { describe, expect, it } from 'vitest'
import { experimentReducer } from './experiment-reducers'
import { emptyExperiment, initialState } from './store'
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

  it('updateExperiment clears selectedPoint (whole experiment replaced)', () => {
    // updateExperiment replaces the entire experiment, which changes all
    // structural fields — the policy must catch it even though it was not among
    // the original 11 per-case clears.
    const next = experimentReducer(withSelection, {
      type: 'updateExperiment',
      payload: emptyExperiment,
    })
    expect('selectedPoint' in next.extras).toBe(false)
  })

  it('copySuggestedToDataPoints clears selectedPoint (appends data points)', () => {
    // Build a state with one enabled numeric variable and one suggested next
    // point — the minimum precondition for copySuggestedToDataPoints to push a
    // new DataEntry. This action was not among the original 11 per-case clears
    // and previously left a stale selection; the uniform policy fixes that.
    const stateWithSuggestion = produce(emptyExperiment, draft => {
      draft.extras.selectedPoint = [1, 2, 'Red']
      draft.valueVariables = [
        {
          type: 'continuous',
          name: 'x',
          description: '',
          min: 0,
          max: 10,
          enabled: true,
        },
      ]
      // results.next holds the suggested point values; index 0 selected via payload [0]
      draft.results.next = [42] as unknown as typeof draft.results.next
    })
    const next = experimentReducer(stateWithSuggestion, {
      type: 'copySuggestedToDataPoints',
      payload: { indices: [0], removeFromSuggestions: false },
    })
    expect('selectedPoint' in next.extras).toBe(false)
  })

  it('setSelectedParetoPoint with null removes selectedPoint (deselect path)', () => {
    // null payload exercises the delete branch and must not leave the key present
    const next = experimentReducer(withSelection, {
      type: 'setSelectedParetoPoint',
      payload: null,
    })
    expect('selectedPoint' in next.extras).toBe(false)
  })
})
