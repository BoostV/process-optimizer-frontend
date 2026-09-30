import { describe, expect, it } from 'vitest'
import { produce } from 'immer'
import md5 from 'md5'
import { rootReducer } from './reducers'
import { emptyExperiment } from './store'
import { State } from './store'
import { createFetchExperimentResultRequest } from './api'
import { settings } from '@core/common'
import { DataEntry, scoreNames } from '@core/common/types'

// A row with a score entered — active (valid + enabled) once validated.
const scoredRow = (id: number, x: number, score: number): DataEntry => ({
  meta: { id, enabled: true, valid: true },
  data: [
    { type: 'numeric', name: 'x', value: x },
    { type: 'score', name: scoreNames[0] ?? 'score', value: score },
  ],
})

// An unscored row, as produced by transferring a suggestion or a pareto point
// to the data table — validation keeps it invalid until a score is entered.
const unscoredRow = (id: number, x: number): DataEntry => ({
  meta: { id, enabled: true, valid: false },
  data: [{ type: 'numeric', name: 'x', value: x }],
})

// A fitted (post-initialization) state with a stored pareto selection whose
// last evaluation matches the current request hash — i.e. the idle state right
// after an evaluation, before the user acts.
const evaluatedState = (): State => {
  const experiment = produce(emptyExperiment, draft => {
    draft.id = 'exp'
    draft.info.version = 2
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
    draft.optimizerConfig.initialPoints = 1
    // xi as the last updateDataPoints pass would have left it (best score 3)
    draft.optimizerConfig.xi = Math.max(0.1, settings.maxRating - 3)
    draft.dataPoints = [scoredRow(1, 5, 3)]
    draft.results.next = [[6]] as unknown as typeof draft.results.next
    draft.extras.selectedPoint = [1.5]
  })
  const evaluated = produce(experiment, draft => {
    draft.lastEvaluationHash = md5(
      JSON.stringify(createFetchExperimentResultRequest(experiment))
    )
    draft.changedSinceLastEvaluation = false
  })
  return { experiment: evaluated }
}

describe('pareto selection invalidation policy', () => {
  it('keeps the selection and does not flag re-evaluation when an unscored row is appended (add-as-data-point)', () => {
    // The row is excluded from the optimizer request (meta.valid: false), so it
    // cannot move the front: transferring a pareto point to the data table must
    // leave the selection and the evaluation state untouched.
    const state = evaluatedState()
    const actual = rootReducer(state, {
      type: 'updateDataPoints',
      payload: [...state.experiment.dataPoints, unscoredRow(2, 7)],
    })
    expect(actual.experiment.extras.selectedPoint).toEqual([1.5])
    expect(actual.experiment.changedSinceLastEvaluation).toBe(false)
  })

  it('keeps the selection when a suggestion is transferred via copySuggestedToDataPoints', () => {
    const state = evaluatedState()
    const actual = rootReducer(state, {
      type: 'copySuggestedToDataPoints',
      payload: { indices: [0], removeFromSuggestions: false },
    })
    expect(actual.experiment.extras.selectedPoint).toEqual([1.5])
    expect(actual.experiment.changedSinceLastEvaluation).toBe(false)
  })

  it('clears the selection when a row becomes active (score entered)', () => {
    const state = evaluatedState()
    const withUnscored = produce(state, draft => {
      draft.experiment.dataPoints.push(unscoredRow(2, 7))
    })
    const actual = rootReducer(withUnscored, {
      type: 'updateDataPoints',
      payload: withUnscored.experiment.dataPoints.map(dp =>
        dp.meta.id === 2 ? scoredRow(2, 7, 4) : dp
      ),
    })
    expect('selectedPoint' in actual.experiment.extras).toBe(false)
    expect(actual.experiment.changedSinceLastEvaluation).toBe(true)
  })

  it('clears the selection when active data points change (row removed)', () => {
    const state = evaluatedState()
    const actual = rootReducer(state, {
      type: 'updateDataPoints',
      payload: [],
    })
    expect('selectedPoint' in actual.experiment.extras).toBe(false)
  })

  it('clears the selection when the experiment is replaced (updateExperiment)', () => {
    const state = evaluatedState()
    const actual = rootReducer(state, {
      type: 'updateExperiment',
      payload: emptyExperiment,
    })
    expect('selectedPoint' in actual.experiment.extras).toBe(false)
  })

  it('does not self-invalidate on setSelectedParetoPoint', () => {
    const state = evaluatedState()
    const actual = rootReducer(state, {
      type: 'setSelectedParetoPoint',
      payload: [2.5],
    })
    expect(actual.experiment.extras.selectedPoint).toEqual([2.5])
  })

  it('keeps the selection across a non-structural action', () => {
    const state = evaluatedState()
    const actual = rootReducer(state, {
      type: 'updateExperimentName',
      payload: 'New name',
    })
    expect(actual.experiment.extras.selectedPoint).toEqual([1.5])
  })
})

describe('setDataPointsUseFunction', () => {
  const baseExperiment = {
    ...emptyExperiment,
    valueVariables: [
      {
        type: 'continuous' as const,
        name: 'F',
        description: '',
        min: 0,
        max: 10,
        enabled: true,
      },
    ],
    scoreVariables: [
      {
        name: 'quality' as const,
        label: 'Quality (0-5)',
        description: '',
        enabled: true,
        scoreFunction: {
          expression: 'w * 2',
          variables: [{ name: 'W', symbol: 'w', source: 'response' as const }],
        },
      },
    ],
    dataPoints: [
      {
        meta: { id: 1, enabled: true, valid: true },
        data: [
          { type: 'numeric' as const, name: 'F', value: 3 },
          { type: 'score' as const, name: 'quality', value: 0 },
        ],
        responses: [
          {
            scoreName: 'quality' as const,
            useFunction: false,
            values: [{ symbol: 'w', value: 4 }],
          },
        ],
      },
      {
        meta: { id: 2, enabled: true, valid: true },
        data: [
          { type: 'numeric' as const, name: 'F', value: 5 },
          { type: 'score' as const, name: 'quality', value: 1.5 },
        ],
        // no responses entry -> missing the required 'w' response
      },
    ],
  }

  it('enables the function for all data points and recomputes where responses exist', () => {
    const state = rootReducer({ experiment: baseExperiment } as State, {
      type: 'setDataPointsUseFunction',
      payload: { scoreName: 'quality', useFunction: true },
    })
    const dps = state.experiment.dataPoints
    // row 1: complete responses -> useFunction on, score recomputed to w*2 = 8
    expect(dps[0]?.responses?.[0]).toMatchObject({
      scoreName: 'quality',
      useFunction: true,
    })
    expect(
      dps[0]?.data.find(d => d.type === 'score' && d.name === 'quality')?.value
    ).toBe(8)
    expect(dps[0]?.meta.valid).toBe(true)
    // row 2: enabled but missing responses -> created entry, marked invalid
    expect(
      dps[1]?.responses?.find(r => r.scoreName === 'quality')?.useFunction
    ).toBe(true)
    expect(dps[1]?.meta.valid).toBe(false)
  })

  it('disables the function only on rows that already have a responses entry', () => {
    const enabled = rootReducer({ experiment: baseExperiment } as State, {
      type: 'setDataPointsUseFunction',
      payload: { scoreName: 'quality', useFunction: true },
    })
    const disabled = rootReducer(enabled, {
      type: 'setDataPointsUseFunction',
      payload: { scoreName: 'quality', useFunction: false },
    })
    disabled.experiment.dataPoints.forEach(dp => {
      const resp = dp.responses?.find(r => r.scoreName === 'quality')
      if (resp) expect(resp.useFunction).toBe(false)
    })
  })
})

describe('copySuggestedToDataPoints defaults to the score function', () => {
  const baseExperiment = {
    ...emptyExperiment,
    valueVariables: [
      {
        type: 'discrete' as const,
        name: 'F',
        description: '',
        min: 0,
        max: 10,
        enabled: true,
      },
    ],
    scoreVariables: [
      {
        name: 'quality' as const,
        label: 'Quality (0-5)',
        description: '',
        enabled: true,
        scoreFunction: {
          expression: 'f * 2',
          variables: [
            {
              name: 'F',
              symbol: 'f',
              source: 'factor' as const,
              factorName: 'F',
            },
          ],
        },
      },
    ],
    dataPoints: [],
    results: {
      ...emptyExperiment.results,
      next: [[3]],
    },
  }

  it('gives a copied suggestion a responses entry and a computed score for a factor-only function', () => {
    const state = rootReducer({ experiment: baseExperiment } as State, {
      type: 'copySuggestedToDataPoints',
      payload: { indices: [0], removeFromSuggestions: false },
    })
    const dp = state.experiment.dataPoints[0]
    expect(dp?.responses).toEqual([
      { scoreName: 'quality', useFunction: true, values: [] },
    ])
    expect(
      dp?.data.find(d => d.type === 'score' && d.name === 'quality')?.value
    ).toBe(6)
  })
})

describe('score-function factor sync', () => {
  const withFn = {
    ...emptyExperiment,
    valueVariables: [
      {
        type: 'discrete' as const,
        name: 'Pin elevation',
        description: '',
        min: 0,
        max: 200,
        enabled: true,
      },
    ],
    scoreVariables: [
      {
        name: 'quality' as const,
        label: 'Quality (0-5)',
        description: '',
        enabled: true,
        scoreFunction: {
          expression: 'pinElevation',
          variables: [
            {
              name: 'Pin elevation',
              symbol: 'pinElevation',
              source: 'factor' as const,
              factorName: 'Pin elevation',
            },
          ],
        },
      },
    ],
    dataPoints: [],
  }

  it('propagates a factor rename into the score function (symbol kept)', () => {
    const s = rootReducer({ experiment: withFn } as State, {
      type: 'editValueVariable',
      payload: {
        index: 0,
        newVariable: {
          type: 'discrete',
          name: 'Pin height',
          description: '',
          min: 0,
          max: 200,
          enabled: true,
        },
      },
    })
    const v = s.experiment.scoreVariables[0]?.scoreFunction?.variables[0]
    expect(v).toMatchObject({
      factorName: 'Pin height',
      name: 'Pin height',
      symbol: 'pinElevation',
    })
  })

  it('prunes a deleted factor from the score function', () => {
    const s = rootReducer({ experiment: withFn } as State, {
      type: 'deleteValueVariable',
      payload: 0,
    })
    expect(
      s.experiment.scoreVariables[0]?.scoreFunction?.variables
    ).toHaveLength(0)
  })
})
