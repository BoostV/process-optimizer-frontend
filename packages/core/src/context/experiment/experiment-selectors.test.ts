import { beforeEach, describe, expect, it } from 'vitest'
import { initialState, State } from '@core/context/experiment/store'
import {
  selectActiveScoreVariableLabels,
  selectActiveScoreVariableNames,
  selectActiveVariablesFromExperiment,
  selectCalculatedSuggestionCount,
  selectId,
  selectInitializationDeficit,
  selectInitializationDeficitFromExperiment,
  selectIsConstraintActive,
  selectIsInitializing,
  selectIsMultiObjective,
  selectIsSuggestionCountEditable,
  selectPlots,
  selectPlotsFromExperiment,
} from './experiment-selectors'
import { rootReducer } from './reducers'
import { createDataPoints } from './test-utils'
import { ExperimentType } from '@core/common'

// A sum constraint is only "active" if its dimensions resolve to enabled
// continuous variables, so tests that exercise an active constraint must
// declare the variables the constraint references.
const continuousVar = (
  name: string
): ExperimentType['valueVariables'][number] => ({
  type: 'continuous',
  name,
  description: '',
  min: 0,
  max: 100,
  enabled: true,
})

describe('Experiment selectors', () => {
  let state: State
  beforeEach(() => {
    state = JSON.parse(JSON.stringify(initialState))
  })

  it('should select ID', () => {
    state.experiment.id = '123'
    expect(selectId(state)).toEqual('123')
  })

  describe('selectIsInitializing', () => {
    it('should return true if dataPoints.length < number of points', () => {
      state.experiment.dataPoints = []
      state.experiment.optimizerConfig.initialPoints = 3
      expect(selectIsInitializing(state)).toBeTruthy()
    })

    it('should return true if number of points is zero', () => {
      state.experiment.optimizerConfig.initialPoints = 0
      expect(selectIsInitializing(state)).toBeTruthy()
    })

    it('should return false if dataPoints.length >= number of points', () => {
      state.experiment.dataPoints = [
        { data: [], meta: { enabled: true, id: 1, valid: true } },
        { data: [], meta: { enabled: true, id: 2, valid: true } },
        { data: [], meta: { enabled: true, id: 3, valid: true } },
      ]
      state.experiment.optimizerConfig.initialPoints = 3
      expect(selectIsInitializing(state)).toBeFalsy()
    })
  })

  describe('selectIsMultiObjective', () => {
    it('should return false for initial ', () => {
      expect(selectIsMultiObjective(initialState)).toEqual(false)
    })

    it('should change value after toggle ', () => {
      const before = selectIsMultiObjective(initialState)
      const toggledOnceState = rootReducer(state, {
        type: 'experiment/toggleMultiObjective',
      })
      const after1stToggle = selectIsMultiObjective(toggledOnceState)
      const toggledTwiceState = rootReducer(toggledOnceState, {
        type: 'experiment/toggleMultiObjective',
      })
      const after2ndToggle = selectIsMultiObjective(toggledTwiceState)
      expect(after1stToggle).toEqual(!before)
      expect(after2ndToggle).toEqual(before)
    })
  })

  describe('selectIsSuggestionCountEditable', () => {
    const constraints: ExperimentType['constraints'] = [
      {
        type: 'sum',
        dimensions: ['a', 'b'],
        value: 100,
      },
    ]
    it.each([
      //data points < initial points, constraint active
      [1, 2, constraints, true],
      //data points < initial points, constraint NOT active
      [1, 2, [], true],
      //data points = initial points, constraint active
      [1, 1, constraints, false],
      //data points = initial points, constraint NOT active
      [1, 1, [], true],
      //data points > initial points, constraint active
      [2, 1, constraints, false],
      //data points > initial points, constraint NOT active
      [2, 1, [], true],
    ])(
      'should be true when data points < intial points or constraints are active',
      (dataPoints, initialPoints, constraints, result) => {
        const editable = selectIsSuggestionCountEditable({
          ...initialState,
          experiment: {
            ...initialState.experiment,
            valueVariables: [continuousVar('a'), continuousVar('b')],
            dataPoints: createDataPoints(dataPoints),
            optimizerConfig: {
              ...initialState.experiment.optimizerConfig,
              initialPoints,
            },
            constraints,
          },
        })
        expect(editable).toBe(result)
      }
    )
  })

  describe('selectCalculatedSuggestionCount', () => {
    const suggestionCount = 5
    const constraints: ExperimentType['constraints'] = [
      {
        type: 'sum',
        dimensions: ['a', 'b'],
        value: 100,
      },
    ]
    it.each([
      //data points < initial points -> deficit (initialPoints - dataPoints)
      [1, 2, constraints, 1],
      //data points < initial points, constraint NOT active -> deficit
      [1, 2, [], 1],
      //data points = initial points, constraint active -> 1
      [1, 1, constraints, 1],
      //data points = initial points, constraint NOT active -> suggestionCount
      [1, 1, [], suggestionCount],
      //data points > initial points, constraint active -> 1
      [2, 1, constraints, 1],
      //data points > initial points, constraint NOT active -> suggestionCount
      [2, 1, [], suggestionCount],
      //data points 0, initial points 3 -> deficit 3
      [0, 3, [], 3],
    ])(
      'should return correct value',
      (dataPoints, initialPoints, constraints, result) => {
        const editable = selectCalculatedSuggestionCount({
          ...initialState,
          experiment: {
            ...initialState.experiment,
            valueVariables: [continuousVar('a'), continuousVar('b')],
            dataPoints: createDataPoints(dataPoints),
            optimizerConfig: {
              ...initialState.experiment.optimizerConfig,
              initialPoints,
            },
            constraints,
            extras: {
              ...initialState.experiment.extras,
              experimentSuggestionCount: suggestionCount,
            },
          },
        })
        expect(editable).toBe(result)
      }
    )
  })

  describe('selectInitializationDeficitFromExperiment', () => {
    const withConfigAndPoints = (
      initialPoints: number,
      points: { enabled: boolean; valid: boolean }[]
    ): ExperimentType => ({
      ...initialState.experiment,
      optimizerConfig: {
        ...initialState.experiment.optimizerConfig,
        initialPoints,
      },
      dataPoints: points.map((p, i) => ({
        meta: { id: i + 1, enabled: p.enabled, valid: p.valid },
        data: [{ type: 'numeric', name: 'Water', value: 100 }],
      })),
    })

    it('returns initialPoints when there are no rows', () => {
      expect(
        selectInitializationDeficitFromExperiment(withConfigAndPoints(3, []))
      ).toBe(3)
    })

    it('counts an enabled but unscored (transferred) row as occupying a slot', () => {
      const exp = withConfigAndPoints(3, [
        { enabled: true, valid: false },
        { enabled: true, valid: false },
        { enabled: true, valid: false },
      ])
      expect(selectInitializationDeficitFromExperiment(exp)).toBe(0)
    })

    it('treats a disabled row as a missing slot', () => {
      const exp = withConfigAndPoints(3, [
        { enabled: true, valid: true },
        { enabled: true, valid: true },
        { enabled: false, valid: true },
      ])
      expect(selectInitializationDeficitFromExperiment(exp)).toBe(1)
    })

    it('never goes below zero', () => {
      const exp = withConfigAndPoints(2, [
        { enabled: true, valid: true },
        { enabled: true, valid: true },
        { enabled: true, valid: true },
      ])
      expect(selectInitializationDeficitFromExperiment(exp)).toBe(0)
    })

    it('selectInitializationDeficit reads from state', () => {
      expect(
        selectInitializationDeficit({
          ...initialState,
          experiment: {
            ...initialState.experiment,
            optimizerConfig: {
              ...initialState.experiment.optimizerConfig,
              initialPoints: 3,
            },
            dataPoints: [],
          },
        })
      ).toBe(3)
    })
  })

  describe('selectIsConstraintActive', () => {
    it.each([
      // > 1 dimensions resolving to enabled continuous variables -> active
      [['a', 'b', 'c'], true],
      [['a', 'b'], true],
      // a single dimension is not a constraint the optimizer can act on
      [['a'], false],
      // degenerate, zero-dimension sum constraint (the proj-with-error case)
      [[], false],
    ])(
      'is active only when > 1 dimensions resolve to real variables',
      (dimensions, result) => {
        const active = selectIsConstraintActive({
          ...initialState.experiment,
          valueVariables: [
            continuousVar('a'),
            continuousVar('b'),
            continuousVar('c'),
          ],
          constraints: [{ type: 'sum', value: 100, dimensions }],
        })
        expect(active).toBe(result)
      }
    )

    it('is inactive when dimensions do not resolve to enabled continuous variables', () => {
      // Two stored dimension names, but only one maps to an enabled continuous
      // variable: 'b' is disabled and 'c' is categorical (not a value variable).
      // The constraint contributes nothing to the request, so the
      // suggestion-count guard must not treat it as active.
      const active = selectIsConstraintActive({
        ...initialState.experiment,
        valueVariables: [
          continuousVar('a'),
          { ...continuousVar('b'), enabled: false },
        ],
        categoricalVariables: [
          { name: 'c', description: '', enabled: true, options: ['x', 'y'] },
        ],
        constraints: [{ type: 'sum', value: 100, dimensions: ['a', 'b', 'c'] }],
      })
      expect(active).toBe(false)
    })
  })

  describe('selectActiveScoreVariableLabels', () => {
    it('should return only enabled score variable labels', () => {
      state.experiment.scoreVariables = [
        { name: 'quality', label: 'Quality', description: '', enabled: true },
        { name: 'cost', label: 'Cost', description: '', enabled: false },
      ]
      expect(selectActiveScoreVariableLabels(state)).toEqual(['Quality'])
    })

    it('should return all score variable labels when all are enabled', () => {
      state.experiment.scoreVariables = [
        { name: 'quality', label: 'Quality', description: '', enabled: true },
        { name: 'cost', label: 'Cost', description: '', enabled: true },
      ]
      expect(selectActiveScoreVariableLabels(state)).toEqual([
        'Quality',
        'Cost',
      ])
    })

    it('should return empty array when no score variables are enabled', () => {
      state.experiment.scoreVariables = [
        { name: 'quality', label: 'Quality', description: '', enabled: false },
      ]
      expect(selectActiveScoreVariableLabels(state)).toEqual([])
    })

    it('should return label for initial state', () => {
      expect(selectActiveScoreVariableLabels(state)).toEqual(['Quality (0-5)'])
    })
  })

  describe('selectActiveScoreVariableNames', () => {
    it('returns names of enabled score variables in order', () => {
      state.experiment.scoreVariables = [
        {
          name: 'quality',
          label: 'Quality (0-5)',
          description: '',
          enabled: true,
        },
        { name: 'cost', label: 'Cost', description: '', enabled: false },
      ]
      expect(selectActiveScoreVariableNames(state)).toEqual(['quality'])
    })

    it('returns all names when all score variables are enabled', () => {
      state.experiment.scoreVariables = [
        {
          name: 'quality',
          label: 'Quality (0-5)',
          description: '',
          enabled: true,
        },
        { name: 'cost', label: 'Cost', description: '', enabled: true },
      ]
      expect(selectActiveScoreVariableNames(state)).toEqual(['quality', 'cost'])
    })

    it('returns empty array when no score variables are enabled', () => {
      state.experiment.scoreVariables = [
        {
          name: 'quality',
          label: 'Quality (0-5)',
          description: '',
          enabled: false,
        },
      ]
      expect(selectActiveScoreVariableNames(state)).toEqual([])
    })
  })

  describe('selectPlots', () => {
    it('should return plots from experiment results', () => {
      state.experiment.results.plots = [
        { id: 'single_1_0', plot: '{"data": []}' },
        { id: 'pareto_data', plot: '{"front": []}' },
      ]
      expect(selectPlots(state)).toEqual([
        { id: 'single_1_0', plot: '{"data": []}' },
        { id: 'pareto_data', plot: '{"front": []}' },
      ])
    })

    it('should return empty array for initial state', () => {
      expect(selectPlots(state)).toEqual([])
    })
  })

  describe('selectPlotsFromExperiment', () => {
    it('should return plots directly from experiment', () => {
      const experiment: ExperimentType = {
        ...initialState.experiment,
        results: {
          ...initialState.experiment.results,
          plots: [{ id: 'single_0_0', plot: '{"data": []}' }],
        },
      }
      expect(selectPlotsFromExperiment(experiment)).toEqual([
        { id: 'single_0_0', plot: '{"data": []}' },
      ])
    })
  })

  describe('selectActiveVariablesFromExperiment', () => {
    it('should filter out disabled variables', () => {
      const experiment: ExperimentType = {
        ...initialState.experiment,
        valueVariables: [
          {
            name: 'Water',
            description: '',
            type: 'continuous',
            min: 0,
            max: 100,
            enabled: true,
          },
          {
            name: 'Cheese',
            description: '',
            type: 'discrete',
            min: 0,
            max: 100,
            enabled: false,
          },
        ],
        categoricalVariables: [
          {
            name: 'Icing',
            description: '',
            options: ['Vanilla', 'Chocolate'],
            enabled: true,
          },
          {
            name: 'Colour',
            description: '',
            options: ['Blue', 'Red'],
            enabled: false,
          },
        ],
      }
      const activeVariables = selectActiveVariablesFromExperiment(experiment)
      expect(activeVariables.length).toBe(2)
      expect(activeVariables[0]?.name).toBe('Water')
      expect(activeVariables[1]?.name).toBe('Icing')
    })
  })
})
