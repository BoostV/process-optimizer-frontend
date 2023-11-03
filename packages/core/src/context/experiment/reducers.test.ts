import { ExperimentAction } from './experiment-reducers'
import { rootReducer } from './reducers'
import {
  currentVersion,
  DataEntry,
  ExperimentResultType,
  ExperimentType,
  OptimizerConfig,
  ValueVariableType,
} from '@core/common/types'
import { emptyExperiment, State } from '@core/context/experiment'
import { versionInfo } from '@core/common'
import { expect } from 'vitest'
import _ from 'lodash'
import { produce } from 'immer'
import {
  createCategoricalVariable,
  createDataPoints,
  createScoreVariable,
  createValueVariable,
  dummyPayloads,
} from '@core/context/experiment/test-utils'

describe('experiment reducer', () => {
  const initState: State = {
    experiment: {
      ...emptyExperiment,
      id: '1234',
      info: {
        swVersion: '',
        name: 'Cake',
        description: 'Yummy',
        dataFormatVersion: currentVersion,
        version: 2,
        extras: {},
      },
      categoricalVariables: [
        {
          name: 'Icing',
          description: 'Sugary',
          options: ['Vanilla', 'Chocolate'],
          enabled: true,
        },
      ],
      valueVariables: [
        {
          type: 'continuous',
          name: 'Water',
          description: 'Wet',
          min: 100,
          max: 200,
          enabled: true,
        },
      ],
      scoreVariables: [
        {
          name: 'score',
          description: 'score',
          enabled: true,
        },
      ],
      optimizerConfig: {
        baseEstimator: 'GP',
        acqFunc: 'gp_hedge',
        initialPoints: 3,
        kappa: 1.96,
        xi: 0.01,
      },
      results: {
        id: '',
        next: [
          [100, 'Vanilla'],
          [150, 'Chocolate'],
        ],
        plots: [],
        pickled: '',
        expectedMinimum: [],
        extras: {},
      },
      dataPoints: [
        {
          meta: {
            enabled: true,
            valid: true,
            id: 1,
          },
          data: [
            {
              type: 'numeric',
              name: 'Water',
              value: 100,
            },
            {
              type: 'categorical',
              name: 'Icing',
              value: 'Vanilla',
            },
            {
              type: 'score',
              name: 'score',
              value: 10,
            },
          ],
        },
      ],
      extras: {
        experimentSuggestionCount: 1,
      },
    },
  }

  describe('updateExperiment', () => {
    it('should update whole experiment', async () => {
      const payload: ExperimentType = {
        id: '5678',
        changedSinceLastEvaluation: false,
        info: {
          swVersion: versionInfo.version,
          name: 'Not cake',
          description: 'Not yummy',
          dataFormatVersion: currentVersion,
          version: 42,
          extras: {},
        },
        categoricalVariables: [
          {
            name: 'Not icing',
            description: 'Not sugary',
            options: [],
            enabled: true,
          },
        ],
        valueVariables: [
          {
            type: 'continuous',
            name: 'Not water',
            description: 'Not wet',
            min: 101,
            max: 201,
            enabled: true,
          },
        ],
        scoreVariables: [],
        constraints: [],
        optimizerConfig: {
          baseEstimator: 'GP',
          acqFunc: 'gp_hedge',
          initialPoints: 4,
          kappa: 1.96,
          xi: 0.01,
        },
        results: {
          id: '123',
          next: [],
          plots: [],
          pickled: '123',
          expectedMinimum: [],
          extras: {},
        },
        dataPoints: [],
        extras: {
          experimentSuggestionCount: 1,
        },
      }

      const action: ExperimentAction = {
        type: 'updateExperiment',
        payload,
      }

      const actual = rootReducer(initState, action)
      expect(actual).toEqual({
        experiment: payload,
      })
    })
  })

  describe('updateExperimentName', () => {
    it('should update name', async () => {
      const actual = rootReducer(initState, {
        type: 'updateExperimentName',
        payload: 'Muffins',
      })
      expect(actual.experiment.info.name).toEqual('Muffins')
    })
  })

  describe('updateExperimentDescription', () => {
    it('should update description', async () => {
      const action: ExperimentAction = {
        type: 'updateExperimentDescription',
        payload: 'Tasty',
      }
      const actual = rootReducer(initState, action)
      expect(actual.experiment.info.description).toEqual('Tasty')
    })
  })

  describe('updateSuggestionCount', () => {
    it('should change suggestion count (min 1, max 10)', () => {
      const actual = rootReducer(initState, {
        type: 'updateSuggestionCount',
        payload: '42',
      })
      expect(actual.experiment.extras).toMatchObject({
        experimentSuggestionCount: 10,
      })
      expect(actual.experiment.changedSinceLastEvaluation).toBeTruthy()
    })
  })

  describe('Constraints', () => {
    describe('setConstraintSum', () => {
      it('should set the value of the sum constraint', () => {
        const actual = rootReducer(initState, {
          type: 'experiment/setConstraintSum',
          payload: 42,
        }).experiment.constraints.find(c => c.type === 'sum')
        expect(actual?.value).toEqual(42)
      })

      it('should add new constraint if one does not exist', () => {
        const stateWithoutConstraint = produce(initState, draft => {
          draft.experiment.constraints = []
        })
        const actual = rootReducer(stateWithoutConstraint, {
          type: 'experiment/setConstraintSum',
          payload: 42,
        }).experiment.constraints.find(c => c.type === 'sum')
        expect(actual?.value).toEqual(42)
      })
    })

    describe('addVariableToConstraintSum', () => {
      it('should add variable to dimension of constraint', () => {
        const actual = rootReducer(initState, {
          type: 'experiment/addVariableToConstraintSum',
          payload: 'name',
        }).experiment.constraints.find(c => c.type === 'sum')
        expect(actual?.dimensions).toContain('name')
      })

      it('should add new constraint if one does not exist', () => {
        const stateWithoutConstraint = produce(initState, draft => {
          draft.experiment.constraints = []
        })
        const actual = rootReducer(stateWithoutConstraint, {
          type: 'experiment/addVariableToConstraintSum',
          payload: 'name',
        }).experiment.constraints.find(c => c.type === 'sum')
        expect(actual?.dimensions).toContain('name')
      })
    })

    describe('removeVariableFromConstraintSum', () => {
      it('should remove variable from dimension of constraint', () => {
        const stateWithConstraint = rootReducer(initState, {
          type: 'experiment/addVariableToConstraintSum',
          payload: 'name',
        })
        const actual = rootReducer(stateWithConstraint, {
          type: 'experiment/removeVariableFromConstraintSum',
          payload: 'name',
        }).experiment.constraints.find(c => c.type === 'sum')
        expect(actual?.dimensions).not.toContain('name')
      })
    })
  })

  describe('Variables', () => {
    describe('addValueVariable', () => {
      it('should add value variable', async () => {
        const payload = createValueVariable({
          type: 'continuous',
          name: 'Flour',
          description: 'Wet',
          min: 300,
          max: 400,
          enabled: true,
        })

        const action: ExperimentAction = {
          type: 'addValueVariable',
          payload,
        }

        const lengthBefore = initState.experiment.valueVariables.length

        const actual = rootReducer(initState, action)

        expect(actual.experiment.valueVariables).toHaveLength(lengthBefore + 1)
        expect(actual.experiment.valueVariables).toMatchObject(
          expect.arrayContaining([expect.objectContaining(payload)])
        )
      })

      it('should set initial points and suggestion', async () => {
        const action: ExperimentAction = {
          type: 'addValueVariable',
          payload: createValueVariable({
            name: 'Flour',
          }),
        }
        const actual = rootReducer(initState, action).experiment
        expect(actual.optimizerConfig.initialPoints).toEqual(5)
        expect(actual.extras.experimentSuggestionCount).toEqual(5)
      })
    })

    it('should use only enabled variables in calculation of initial points and suggestion', async () => {
      const stateWithManyDisabledValues = produce(initState, draft => {
        const variables = ['name1', 'name2', 'name3', 'name4'].map(
          name =>
            ({
              type: 'continuous',
              name: name,
              description: '',
              min: 0,
              max: 0,
              enabled: false,
            } satisfies ValueVariableType)
        )
        variables.forEach(v => draft.experiment.valueVariables.push(v))
      })

      const action: ExperimentAction = {
        type: 'addValueVariable',
        payload: createValueVariable({
          name: 'Flour',
        }),
      }

      const actual = rootReducer(stateWithManyDisabledValues, action).experiment

      expect(actual.optimizerConfig.initialPoints).toEqual(5)
      expect(actual.extras.experimentSuggestionCount).toEqual(5)
    })

    describe('deleteValueVariable', () => {
      it('should delete value variable', async () => {
        const action: ExperimentAction = {
          type: 'deleteValueVariable',
          payload: 0,
        }
        const newState = rootReducer(initState, action)
        expect(newState.experiment.valueVariables).toEqual([])
        expect(newState.experiment.dataPoints[0]?.data).toEqual([
          {
            type: 'categorical',
            name: 'Icing',
            value: 'Vanilla',
          },
          {
            type: 'score',
            name: 'score',
            value: 10,
          },
        ])
      })

      it('should delete data points if there are no variables', async () => {
        const action: ExperimentAction = {
          type: 'deleteValueVariable',
          payload: 0,
        }
        const newState = rootReducer(
          {
            ...initState,
            experiment: { ...initState.experiment, categoricalVariables: [] },
          },
          action
        )
        expect(newState.experiment.valueVariables).toEqual([])
        expect(newState.experiment.dataPoints).toEqual([])
      })

      it('should reset initial points and suggestion', async () => {
        const action: ExperimentAction = {
          type: 'deleteValueVariable',
          payload: 0,
        }

        expect(
          rootReducer(initState, action).experiment.optimizerConfig
            .initialPoints
        ).toEqual(5)
        expect(
          rootReducer(initState, action).experiment.extras
            .experimentSuggestionCount
        ).toEqual(5)
      })

      it('should remove variable from constraint dimensions', () => {
        const variable = createValueVariable({ name: 'value1' })
        const stateWithConstraintAndVariable = (
          [
            { type: 'addValueVariable', payload: variable },
            {
              type: 'experiment/addVariableToConstraintSum',
              payload: 'value1',
            },
          ] satisfies ExperimentAction[]
        ).reduce(rootReducer, initState)

        const actual = rootReducer(stateWithConstraintAndVariable, {
          type: 'deleteValueVariable',
          payload:
            stateWithConstraintAndVariable.experiment.valueVariables.findIndex(
              v => v.name === 'value1'
            ),
        }).experiment.constraints.find(c => c.type === 'sum')
        expect(actual?.dimensions).not.toContain('value1')
      })
    })

    describe('editValueVariable', () => {
      it('should edit value variable', () => {
        const newVariable: ValueVariableType = {
          type: 'continuous',
          name: 'new name',
          description: 'new description',
          min: 1,
          max: 2,
          enabled: true,
        }
        const payload: {
          index: number
          newVariable: ValueVariableType
        } = {
          index: 0,
          newVariable,
        }
        const newState = rootReducer(initState, {
          type: 'editValueVariable',
          payload,
        })
        expect(newState.experiment.valueVariables).toEqual([{ ...newVariable }])
        expect(newState.experiment.dataPoints[0]?.data[0]?.name).toEqual(
          'new name'
        )
      })

      it('should edit value variable from continous to discrete', () => {
        const newVariable: ValueVariableType = {
          type: 'discrete',
          name: 'new name',
          description: 'new description',
          min: 101.25,
          max: 202.89,
          enabled: true,
        }
        const payload: {
          index: number
          newVariable: ValueVariableType
        } = {
          index: 0,
          newVariable,
        }
        const oldVariable: ValueVariableType = {
          name: 'Water',
          type: 'continuous',
          description: 'oldDesc',
          min: 100.56,
          max: 200.89,
          enabled: true,
        }
        const newState = rootReducer(
          {
            ...initState,
            experiment: {
              ...initState.experiment,
              valueVariables: [oldVariable],
              dataPoints: [
                {
                  meta: {
                    enabled: true,
                    valid: true,
                    id: 1,
                  },
                  data: [
                    {
                      type: 'numeric',
                      name: 'Water',
                      value: 117.45,
                    },
                    {
                      type: 'categorical',
                      name: 'Icing',
                      value: 'Vanilla',
                    },
                    {
                      type: 'score',
                      name: 'score',
                      value: 10,
                    },
                  ],
                },
              ],
            },
          },
          {
            type: 'editValueVariable',
            payload,
          }
        )
        expect(newState.experiment.valueVariables).toEqual([
          { ...newVariable, min: 101, max: 203 },
        ])
        expect(newState.experiment.dataPoints[0]?.data[0]?.name).toEqual(
          'new name'
        )
        expect(newState.experiment.dataPoints[0]?.data[0]?.value).toEqual(117)
      })

      it('should rename constraint dimensions if needed', () => {
        const variable = createValueVariable({ name: 'value1' })
        const renamedVariable = createValueVariable({ name: 'renamedValue1' })
        const stateWithConstraintAndVariable = (
          [
            { type: 'addValueVariable', payload: variable },
            {
              type: 'experiment/addVariableToConstraintSum',
              payload: 'value1',
            },
          ] satisfies ExperimentAction[]
        ).reduce(rootReducer, initState)

        const actual = rootReducer(stateWithConstraintAndVariable, {
          type: 'editValueVariable',
          payload: {
            index:
              stateWithConstraintAndVariable.experiment.valueVariables.findIndex(
                v => v.name === 'value1'
              ),
            newVariable: renamedVariable,
          },
        }).experiment.constraints.find(c => c.type === 'sum')
        expect(actual?.dimensions).toContain('renamedValue1')
      })
    })

    describe('addCategorialVariable', () => {
      it('should add categorial variable', async () => {
        const payload = createCategoricalVariable({
          name: 'Fat',
        })

        const action: ExperimentAction = {
          type: 'addCategorialVariable',
          payload,
        }
        const lengthBefore = initState.experiment.categoricalVariables.length
        const actual = rootReducer(initState, action).experiment
        expect(actual.categoricalVariables).toHaveLength(lengthBefore + 1)
        expect(actual.categoricalVariables).toMatchObject(
          expect.arrayContaining([payload])
        )
      })

      it('should set initial points and suggestion', async () => {
        const action: ExperimentAction = {
          type: 'addCategorialVariable',
          payload: createCategoricalVariable({
            name: 'Fat',
          }),
        }
        const actual = rootReducer(initState, action).experiment
        expect(actual.optimizerConfig.initialPoints).toEqual(5)
        expect(actual.extras.experimentSuggestionCount).toEqual(5)
      })
    })

    describe('deleteCategorialVariable', () => {
      it('should delete categorical variable', async () => {
        const action: ExperimentAction = {
          type: 'deleteCategorialVariable',
          payload: 0,
        }
        const newState = rootReducer(initState, action)
        expect(newState.experiment.categoricalVariables).toEqual([])
        expect(newState.experiment.dataPoints[0]?.data).toEqual([
          {
            type: 'numeric',
            name: 'Water',
            value: 100,
          },
          {
            type: 'score',
            name: 'score',
            value: 10,
          },
        ])
      })

      it('should reset suggestion count and initial points', async () => {
        const action: ExperimentAction = {
          type: 'deleteCategorialVariable',
          payload: 0,
        }

        expect(
          rootReducer(initState, action).experiment.optimizerConfig
            .initialPoints
        ).toEqual(5)
        expect(
          rootReducer(initState, action).experiment.extras
            .experimentSuggestionCount
        ).toEqual(5)
      })
    })

    describe('editCategoricalVariable', () => {
      it('should edit categorical variable', () => {
        const newVariable = createCategoricalVariable({
          name: 'new name',
          description: 'new description',
          options: ['a', 'b'],
          enabled: true,
        })
        const actual = rootReducer(initState, {
          type: 'editCategoricalVariable',
          payload: { index: 0, newVariable },
        }).experiment

        expect(actual.categoricalVariables).toMatchObject(
          expect.arrayContaining([expect.objectContaining(newVariable)])
        )
        expect(actual.dataPoints[0]?.data[1]?.name).toEqual('new name')
      })

      it('should update option in data points if it exists', () => {
        const newVariable = createCategoricalVariable({
          name: 'new name',
          description: 'new description',
          options: ['a', 'Vanilla'],
          enabled: true,
        })

        const actual = rootReducer(initState, {
          type: 'editCategoricalVariable',
          payload: { index: 0, newVariable },
        }).experiment
        expect(actual.categoricalVariables).toMatchObject(
          expect.arrayContaining([expect.objectContaining(newVariable)])
        )
        expect(actual.dataPoints[0]?.data[1]?.value).toEqual('Vanilla')
      })

      it('should keep old value when categorical option is deleted', () => {
        const newVariable = createCategoricalVariable({
          name: 'new name',
          description: 'new description',
          options: ['a', 'b'],
          enabled: true,
        })
        const actual = rootReducer(initState, {
          type: 'editCategoricalVariable',
          payload: { index: 0, newVariable },
        }).experiment
        expect(actual.dataPoints[0]?.data[1]?.value).toEqual('Vanilla')
      })
    })
  })

  describe('updateConfiguration', () => {
    it('should update configuration', async () => {
      const payload: OptimizerConfig = {
        baseEstimator: 'GP',
        acqFunc: 'gp_hedge',
        initialPoints: 1,
        kappa: 1.97,
        xi: 0.02,
      }

      const action: ExperimentAction = {
        type: 'updateConfiguration',
        payload,
      }
      const actual = rootReducer(initState, action).experiment
      expect(actual.changedSinceLastEvaluation).toEqual(true)
      expect(actual.optimizerConfig).toMatchObject(payload)
    })

    it('should not change suggested experiments when changing initial points to something less than length of data points', () => {
      const payload: OptimizerConfig = {
        ...emptyExperiment.optimizerConfig,
        initialPoints: 2,
      }
      const testState = produce(initState, draft => {
        draft.experiment.extras = { experimentSuggestionCount: 1 }
        draft.experiment.dataPoints = createDataPoints(3)
      })
      const actual = rootReducer(testState, {
        type: 'updateConfiguration',
        payload,
      }).experiment
      expect(actual.extras.experimentSuggestionCount).toEqual(1)
    })
  })

  describe('ResultRegisteredAction', () => {
    it('should update result', async () => {
      const payload: ExperimentResultType = {
        id: 'myExperiment',
        next: [[1, 2, 3, 'Red']],
        pickled: 'pickled',
        expectedMinimum: [],
        extras: {},
        plots: [{ id: 'sample', plot: 'base64encodedData' }],
      }

      const action: ExperimentAction = {
        type: 'registerResult',
        payload: payload,
      }

      expect(rootReducer(initState, action)).toMatchObject({
        experiment: {
          changedSinceLastEvaluation: false,
          lastEvaluationHash: expect.stringMatching(/.+/),
          results: payload,
        },
      })
    })
  })

  describe('DataPointsUpdatedAction', () => {
    it('should update data points', async () => {
      const payload: DataEntry[] = createDataPoints(1)

      const action: ExperimentAction = {
        type: 'updateDataPoints',
        payload,
      }
      const actual = rootReducer(initState, action).experiment
      expect(actual.dataPoints).toEqual(payload)
    })

    it.each(new Array(100).fill(0))(
      'should sort data points according to variable definitions',
      () => {
        const values = ['value1', 'value2', 'value3']
        const cats = ['cat1', 'cat2', 'cat3']
        const scores = ['score', 'score2']

        const testState = produce(initState, draft => {
          draft.experiment.valueVariables = values.map(name =>
            createValueVariable({
              name,
            })
          )
          draft.experiment.categoricalVariables = cats.map(name =>
            createCategoricalVariable({
              name,
              options: ['test'],
            })
          )
          draft.experiment.scoreVariables = scores.map(name =>
            createScoreVariable({
              name,
            })
          )
        })

        const payload: DataEntry[] = createDataPoints(
          1,
          values,
          cats,
          scores,
          true
        ).map(dr => ({
          ...dr,
          data: _.shuffle(dr.data),
        }))

        const action: ExperimentAction = {
          type: 'updateDataPoints',
          payload,
        }
        const expected = [
          'value1',
          'value2',
          'value3',
          'cat1',
          'cat2',
          'cat3',
          'score',
          'score2',
        ]
        const actual = rootReducer(testState, action).experiment.dataPoints.map(
          dr => dr.data.map(d => d.name)
        )
        actual.forEach(namesRow => expect(namesRow).toEqual(expected))
      }
    )
  })

  describe('copySuggestedToDataPoints', () => {
    it('should copy one row from suggested to data points', () => {
      const action: ExperimentAction = {
        type: 'copySuggestedToDataPoints',
        payload: [0],
      }
      const dp = rootReducer(initState, action).experiment.dataPoints
      expect(dp.length).toBe(2)
      expect(dp[dp.length - 1]?.meta.enabled).toBeTruthy()
      expect(dp[dp.length - 1]?.meta.valid).toBeFalsy()
      expect(dp[dp.length - 1]?.meta.id).toBe(2)
      expect(dp[dp.length - 1]?.data).toEqual([
        expect.objectContaining({
          type: 'numeric',
          name: 'Water',
          value: 100,
        }),
        expect.objectContaining({
          type: 'categorical',
          name: 'Icing',
          value: 'Vanilla',
        }),
      ])
    })

    it('should copy multiple rows from suggested to data points', () => {
      const action: ExperimentAction = {
        type: 'copySuggestedToDataPoints',
        payload: [0, 1],
      }
      const dp = rootReducer(initState, action).experiment.dataPoints
      expect(dp.length).toBe(3)
      //Check second-to-last item
      expect(dp[dp.length - 1]?.meta.enabled).toBeTruthy()
      expect(dp[dp.length - 1]?.meta.valid).toBeFalsy()
      expect(dp[dp.length - 2]?.meta.id).toBe(2)
      expect(dp[dp.length - 2]?.data).toEqual([
        { type: 'numeric', name: 'Water', value: 100 },
        { type: 'categorical', name: 'Icing', value: 'Vanilla' },
      ])
      //Check last item
      expect(dp[dp.length - 1]?.meta.enabled).toBeTruthy()
      expect(dp[dp.length - 1]?.meta.valid).toBeFalsy()
      expect(dp[dp.length - 1]?.meta.id).toBe(3)
      expect(dp[dp.length - 1]?.data).toEqual([
        { type: 'numeric', name: 'Water', value: 150 },
        { type: 'categorical', name: 'Icing', value: 'Chocolate' },
      ])
    })

    it('should only copy enabled variables to data points', () => {
      const action: ExperimentAction = {
        type: 'copySuggestedToDataPoints',
        payload: [0],
      }
      const state: State = {
        ...initState,
        experiment: {
          ...initState.experiment,
          valueVariables: [
            {
              type: 'continuous',
              name: 'Water',
              description: 'Wet',
              min: 100,
              max: 200,
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
          ],
          dataPoints: [],
          results: {
            ...initState.experiment.results,
            next: [['Vanilla'], ['Chocolate']],
          },
        },
      }
      const newDataPoints = rootReducer(state, action).experiment.dataPoints
      expect(newDataPoints.length).toBe(1)
      expect(newDataPoints[0]?.data).toEqual([
        {
          type: 'categorical',
          name: 'Icing',
          value: 'Vanilla',
        },
      ])
    })
  })

  it('should add scores to new data point for multi-objective - two scores enabled', () => {
    const testState = {
      ...initState,
      experiment: {
        ...initState.experiment,
        scoreVariables: [
          {
            name: 'score',
            description: 'score',
            enabled: true,
          },
          {
            name: 'score2',
            description: 'score 2',
            enabled: true,
          },
        ],
      },
    }
    const action: ExperimentAction = {
      type: 'copySuggestedToDataPoints',
      payload: [0],
    }
    const dp = rootReducer(testState, action).experiment.dataPoints
    expect(dp[dp.length - 1]?.data).toEqual([
      {
        type: 'numeric',
        name: 'Water',
        value: 100,
      },
      {
        type: 'categorical',
        name: 'Icing',
        value: 'Vanilla',
      },
    ])
  })
  it('should add scores to new data point for multi-objective - one score enabled', () => {
    const testState = {
      ...initState,
      experiment: {
        ...initState.experiment,
        scoreVariables: [
          {
            name: 'score',
            description: 'score',
            enabled: true,
          },
          {
            name: 'score2',
            description: 'score 2',
            enabled: false,
          },
        ],
      },
    }
    const action: ExperimentAction = {
      type: 'copySuggestedToDataPoints',
      payload: [0],
    }
    const dp = rootReducer(testState, action).experiment.dataPoints
    expect(dp[dp.length - 1]?.data).toEqual([
      {
        type: 'numeric',
        name: 'Water',
        value: 100,
      },
      {
        type: 'categorical',
        name: 'Icing',
        value: 'Vanilla',
      },
    ])
  })

  it('should update xi when updating data points', () => {
    //Xi = Max(0.1, maxPossibleScore (5) - bestScoreGiven)
    const scores = [1.5, 4.4, 2.5]
    const dp = createDataPoints(
      scores.length,
      ['Water'],
      ['Icing'],
      ['score', 'score2'],
      true,
      scores
    )
    const actual = rootReducer(
      {
        ...initState,
        experiment: {
          ...initState.experiment,
          scoreVariables: [
            {
              name: 'score',
              description: 'score',
              enabled: true,
            },
            {
              name: 'score2',
              description: 'score 2',
              enabled: true,
            },
          ],
        },
      },
      {
        type: 'updateDataPoints',
        payload: dp,
      }
    )
    expect(actual.experiment.optimizerConfig.xi).toBe(0.6)
  })

  it('should update xi when updating data points - should return 0.1 when best = max', () => {
    //Xi = Max(0.1, maxPossibleScore (5) - bestScoreGiven)
    const scores = [1.5, 4.4, 5]
    const dp = createDataPoints(
      scores.length,
      ['Water'],
      ['Icing'],
      ['score', 'score2'],
      true,
      scores
    )
    const actual = rootReducer(
      {
        ...initState,
        experiment: {
          ...initState.experiment,
          scoreVariables: [
            {
              name: 'score',
              description: 'score',
              enabled: true,
            },
            {
              name: 'score2',
              description: 'score 2',
              enabled: true,
            },
          ],
        },
      },
      {
        type: 'updateDataPoints',
        payload: dp,
      }
    )
    expect(actual.experiment.optimizerConfig.xi).toBe(0.1)
  })

  it('should increment version for all actions except updateExperiment', () => {
    Object.entries(dummyPayloads)
      .filter(([k]) => k !== 'updateExperiment')
      .forEach(([k, v]) => {
        expect(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          rootReducer(initState, { type: k, payload: v }).experiment.info
            .version
        ).toEqual(initState.experiment.info.version + 1)
      })
  })

  it('should not increment version for updateExperiment', () => {
    Object.entries(dummyPayloads)
      .filter(([k]) => k === 'updateExperiment')
      .forEach(([k, v]) => {
        expect(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          rootReducer(initState, { type: k, payload: v }).experiment.info
            .version
        ).toEqual(dummyPayloads.updateExperiment.info.version)
      })
  })
})
