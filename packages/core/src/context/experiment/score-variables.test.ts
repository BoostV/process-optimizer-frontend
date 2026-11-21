import { describe, expect, it } from 'vitest'
import { produce } from 'immer'
import md5 from 'md5'
import { rootReducer } from './reducers'
import { initialState, initialStateMultiObjective, State } from './store'
import { createFetchExperimentResultRequest } from './api'
import { selectActiveScoreVariables } from './experiment-selectors'

// A two-factor, two-score experiment with one scored data point whose stored
// evaluation hash matches its current request (i.e. "nothing changed").
const evaluatedMulti = (): State => {
  const withData = produce(initialStateMultiObjective, draft => {
    draft.experiment.valueVariables = [
      {
        type: 'continuous',
        name: 'Water',
        description: '',
        min: 0,
        max: 10,
        enabled: true,
      },
    ]
    // xi as the reducer derives it from the data below (5 - best quality)
    draft.experiment.optimizerConfig.xi = 2
    draft.experiment.dataPoints = [
      {
        meta: { id: 1, enabled: true, valid: true },
        data: [
          { type: 'numeric', name: 'Water', value: 5 },
          { type: 'score', name: 'quality', value: 3 },
          { type: 'score', name: 'cost', value: 7 },
        ],
      },
    ]
  })
  return produce(withData, draft => {
    draft.experiment.lastEvaluationHash = md5(
      JSON.stringify(createFetchExperimentResultRequest(draft.experiment))
    )
    draft.experiment.changedSinceLastEvaluation = false
  })
}

describe('updateScoreVariables', () => {
  it('sets the trimmed label and the direction of the named score only', () => {
    const start = evaluatedMulti()
    const next = rootReducer(start, {
      type: 'updateScoreVariables',
      payload: [{ name: 'quality', label: ' Yield ', maximize: false }],
    })
    expect(next.experiment.scoreVariables[0]).toMatchObject({
      name: 'quality',
      label: 'Yield',
      maximize: false,
      enabled: true,
    })
    expect(next.experiment.scoreVariables[1]).toEqual(
      start.experiment.scoreVariables[1]
    )
  })

  it('marks the experiment as changed when a direction changes', () => {
    const next = rootReducer(evaluatedMulti(), {
      type: 'updateScoreVariables',
      payload: [{ name: 'cost', label: 'Cost', maximize: true }],
    })
    expect(next.experiment.changedSinceLastEvaluation).toBe(true)
  })

  it('does not mark the experiment as changed when only a name changes', () => {
    const next = rootReducer(evaluatedMulti(), {
      type: 'updateScoreVariables',
      payload: [{ name: 'cost', label: 'Waste', maximize: false }],
    })
    expect(next.experiment.scoreVariables[1]?.label).toBe('Waste')
    expect(next.experiment.changedSinceLastEvaluation).toBe(false)
  })

  it('clears a stored pareto selection when a direction changes', () => {
    const start = produce(evaluatedMulti(), draft => {
      draft.experiment.extras.selectedPoint = [5]
    })
    const next = rootReducer(start, {
      type: 'updateScoreVariables',
      payload: [{ name: 'cost', label: 'Cost', maximize: true }],
    })
    expect('selectedPoint' in next.experiment.extras).toBe(false)
  })

  it('keeps a stored pareto selection when only a name changes', () => {
    const start = produce(evaluatedMulti(), draft => {
      draft.experiment.extras.selectedPoint = [5]
    })
    const next = rootReducer(start, {
      type: 'updateScoreVariables',
      payload: [{ name: 'cost', label: 'Waste', maximize: false }],
    })
    expect(next.experiment.extras.selectedPoint).toEqual([5])
  })

  it('uses the xi floor when the first score is minimized', () => {
    const next = rootReducer(evaluatedMulti(), {
      type: 'updateScoreVariables',
      payload: [{ name: 'quality', label: 'Quality', maximize: false }],
    })
    expect(next.experiment.optimizerConfig.xi).toBe(0.1)
  })

  it('keeps the existing xi rule while the first score is maximized', () => {
    // best quality is 3 on the 0-5 scale → xi = 5 - 3
    const next = rootReducer(evaluatedMulti(), {
      type: 'updateScoreVariables',
      payload: [{ name: 'quality', label: 'Yield', maximize: true }],
    })
    expect(next.experiment.optimizerConfig.xi).toBe(2)
  })

  it('a name-only change leaves a stale xi alone, so nothing is re-evaluated', () => {
    // Stored xi is not always what calculateXi would return right now.
    const start = produce(evaluatedMulti(), draft => {
      draft.experiment.optimizerConfig.xi = 5
      draft.experiment.lastEvaluationHash = md5(
        JSON.stringify(createFetchExperimentResultRequest(draft.experiment))
      )
    })
    const next = rootReducer(start, {
      type: 'updateScoreVariables',
      payload: [{ name: 'quality', label: 'Taste', maximize: true }],
    })
    expect(next.experiment.optimizerConfig.xi).toBe(5)
    expect(next.experiment.changedSinceLastEvaluation).toBe(false)
  })

  it('flipping a direction drops the stored results (they are in the old sign)', () => {
    const start = produce(evaluatedMulti(), draft => {
      draft.experiment.results = {
        id: 'r',
        next: [[1]],
        plots: [{ id: 'single_0_0', plot: '{}' }],
        pickled: 'abc',
        expectedMinimum: [[5], 1],
        extras: {},
      }
    })
    const next = rootReducer(start, {
      type: 'updateScoreVariables',
      payload: [{ name: 'quality', label: 'Quality (0-5)', maximize: false }],
    })
    expect(next.experiment.results).toMatchObject({
      next: [],
      plots: [],
      pickled: '',
      expectedMinimum: [],
    })
  })

  it('a name-only change keeps the stored results', () => {
    const start = produce(evaluatedMulti(), draft => {
      draft.experiment.results.pickled = 'abc'
      draft.experiment.results.plots = [{ id: 'single_0_0', plot: '{}' }]
    })
    const next = rootReducer(start, {
      type: 'updateScoreVariables',
      payload: [{ name: 'quality', label: 'Taste', maximize: true }],
    })
    expect(next.experiment.results).toEqual(start.experiment.results)
  })

  it('a renamed first score survives switching to multi objective, cost gets defaults', () => {
    const renamed = rootReducer(initialState, {
      type: 'updateScoreVariables',
      payload: [{ name: 'quality', label: 'Yield', maximize: true }],
    })
    const multi = rootReducer(renamed, {
      type: 'experiment/toggleMultiObjective',
    })
    expect(multi.experiment.scoreVariables).toMatchObject([
      { name: 'quality', label: 'Yield', maximize: true },
      { name: 'cost', label: 'Cost', maximize: false },
    ])
  })
})

describe('selectActiveScoreVariables', () => {
  it('returns enabled score variables only, in order', () => {
    const state = produce(initialStateMultiObjective, draft => {
      const cost = draft.experiment.scoreVariables[1]
      if (cost) cost.enabled = false
    })
    expect(selectActiveScoreVariables(state).map(s => s.name)).toEqual([
      'quality',
    ])
    expect(
      selectActiveScoreVariables(initialStateMultiObjective).map(s => s.name)
    ).toEqual(['quality', 'cost'])
  })
})
