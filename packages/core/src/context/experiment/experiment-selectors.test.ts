import { beforeEach, describe, expect, it } from 'vitest'
import { initialState, State } from '@core/context/experiment/store'
import {
  selectActiveVariablesFromExperiment,
  selectCalculatedSuggestionCount,
  selectId,
  selectIsConstraintActive,
  selectIsInitializing,
  selectIsMultiObjective,
  selectIsSuggestionCountEditable,
} from './experiment-selectors'
import { rootReducer } from './reducers'
import { createDataPoints } from './test-utils'
import { ExperimentType } from '@core/common'

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
      //data points < initial points, constraint active -> initial points
      [1, 2, constraints, 2],
      //data points < initial points, constraint NOT active -> initial points
      [1, 2, [], 2],
      //data points = initial points, constraint active -> 1
      [1, 1, constraints, 1],
      //data points = initial points, constraint NOT active -> suggestionCount
      [1, 1, [], suggestionCount],
      //data points > initial points, constraint active -> 1
      [2, 1, constraints, 1],
      //data points > initial points, constraint NOT active -> suggestionCount
      [2, 1, [], suggestionCount],
    ])(
      'should return correct value',
      (dataPoints, initialPoints, constraints, result) => {
        const editable = selectCalculatedSuggestionCount({
          ...initialState,
          experiment: {
            ...initialState.experiment,
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

  describe('selectIsConstraintActive', () => {
    it.each([
      [['a', 'b', 'c'], true],
      [['a', 'b'], true],
      [['a'], false],
      [[], false],
    ])(
      'should return true when number of sum constraint variables > 1',
      (dimensions, result) => {
        const editable = selectIsConstraintActive({
          ...initialState.experiment,
          constraints: [
            {
              type: 'sum',
              value: 100,
              dimensions,
            },
          ],
        })
        expect(editable).toBe(result)
      }
    )
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
