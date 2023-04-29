import { ExperimentAction } from './experiment-reducers'
import { rootReducer } from './reducers'
import {
  CategoricalVariableType,
  currentVersion,
  DataEntry,
  DataPointType,
  ExperimentResultType,
  ExperimentType,
  OptimizerConfig,
  ValueVariableType,
} from '@core/common/types'
import { emptyExperiment, State } from '@core/context/experiment'
import { versionInfo } from '@core/common'
import { expect } from 'vitest'
import _ from 'lodash'
import produce from 'immer'

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
      },
      categoricalVariables: [
        {
          name: 'Icing',
          description: 'Sugary',
          options: ['Vanilla', 'Chocolate'],
        },
      ],
      valueVariables: [
        {
          type: 'continuous',
          name: 'Water',
          description: 'Wet',
          min: 100,
          max: 200,
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
        },
        categoricalVariables: [
          {
            name: 'Not icing',
            description: 'Not sugary',
            options: [],
          },
        ],
        valueVariables: [
          {
            type: 'continuous',
            name: 'Not water',
            description: 'Not wet',
            min: 101,
            max: 201,
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
      const action: ExperimentAction = {
        type: 'updateExperimentName',
        payload: 'Muffins',
      }

      expect(rootReducer(initState, action)).toEqual({
        experiment: {
          ...initState.experiment,
          id: '1234',
          info: {
            ...initState.experiment.info,
            name: 'Muffins',
          },
        },
      })
    })
  })

  describe('updateExperimentDescription', () => {
    it('should update description', async () => {
      const action: ExperimentAction = {
        type: 'updateExperimentDescription',
        payload: 'Tasty',
      }
      expect(rootReducer(initState, action)).toEqual({
        experiment: {
          ...initState.experiment,
          info: {
            ...initState.experiment.info,
            description: 'Tasty',
          },
        },
      })
    })
  })

  describe('updateSuggestionCount', () => {
    it('should change suggestion count', () => {
      const newState = rootReducer(initState, {
        type: 'updateSuggestionCount',
        payload: '42',
      })
      expect(newState.experiment.extras).toMatchObject({
        experimentSuggestionCount: 42,
      })
      expect(newState.experiment.changedSinceLastEvaluation).toBeTruthy()
    })
  })

  describe('Variables', () => {
    describe('addValueVariable', () => {
      it('should add value variable', async () => {
        const payload: ValueVariableType = {
          type: 'continuous',
          name: 'Flour',
          description: 'Wet',
          min: 300,
          max: 400,
        }

        const action: ExperimentAction = {
          type: 'addValueVariable',
          payload,
        }

        expect(
          rootReducer(initState, action).experiment.valueVariables
        ).toEqual([
          {
            name: 'Water',
            description: 'Wet',
            type: 'continuous',
            min: 100,
            max: 200,
          },
          payload,
        ])
      })

      it('should set initial points and suggestion', async () => {
        const payload: ValueVariableType = {
          type: 'continuous',
          name: 'Flour',
          description: 'Wet',
          min: 300,
          max: 400,
        }

        const action: ExperimentAction = {
          type: 'addValueVariable',
          payload,
        }

        expect(
          rootReducer(initState, action).experiment.optimizerConfig
            .initialPoints
        ).toEqual(9)
        expect(
          rootReducer(initState, action).experiment.extras
            .experimentSuggestionCount
        ).toEqual(9)
      })
    })

    describe('deleteValueVariable', () => {
      it('should delete value variable', async () => {
        const action: ExperimentAction = {
          type: 'deleteValueVariable',
          payload: 0,
        }
        expect(
          rootReducer(initState, action).experiment.valueVariables
        ).toEqual([])
      })

      it('should reset initial points and suggestion', async () => {
        const action: ExperimentAction = {
          type: 'deleteValueVariable',
          payload: 0,
        }

        expect(
          rootReducer(initState, action).experiment.optimizerConfig
            .initialPoints
        ).toEqual(3)
        expect(
          rootReducer(initState, action).experiment.extras
            .experimentSuggestionCount
        ).toEqual(3)
      })
    })

    describe('addCategorialVariable', () => {
      it('should add categorial variable', async () => {
        const payload: CategoricalVariableType = {
          name: 'Fat',
          description: 'Fatty',
          options: [],
        }

        const action: ExperimentAction = {
          type: 'addCategorialVariable',
          payload,
        }

        expect(
          rootReducer(initState, action).experiment.categoricalVariables
        ).toEqual([
          {
            name: 'Icing',
            description: 'Sugary',
            options: ['Vanilla', 'Chocolate'],
          },
          payload,
        ])
      })

      it('should set initial points and suggestion', async () => {
        const payload: CategoricalVariableType = {
          name: 'Fat',
          description: 'Fatty',
          options: [],
        }

        const action: ExperimentAction = {
          type: 'addCategorialVariable',
          payload,
        }

        expect(
          rootReducer(initState, action).experiment.optimizerConfig
            .initialPoints
        ).toEqual(9)
        expect(
          rootReducer(initState, action).experiment.extras
            .experimentSuggestionCount
        ).toEqual(9)
      })
    })

    describe('deleteCategorialVariable', () => {
      it('should delete categorical variable', async () => {
        const action: ExperimentAction = {
          type: 'deleteCategorialVariable',
          payload: 0,
        }

        expect(
          rootReducer(initState, action).experiment.categoricalVariables
        ).toEqual([])
      })

      it('should reset suggestion count and initial points', async () => {
        const action: ExperimentAction = {
          type: 'deleteCategorialVariable',
          payload: 0,
        }

        expect(
          rootReducer(initState, action).experiment.optimizerConfig
            .initialPoints
        ).toEqual(3)
        expect(
          rootReducer(initState, action).experiment.extras
            .experimentSuggestionCount
        ).toEqual(3)
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

      expect(rootReducer(initState, action)).toEqual({
        experiment: {
          ...initState.experiment,
          changedSinceLastEvaluation: true,
          optimizerConfig: payload,
        },
      })
    })

    it('should set suggested experiments to intial points if length of datapoints is less than initial points', () => {
      const payload: OptimizerConfig = {
        ...emptyExperiment.optimizerConfig,
        initialPoints: 4,
      }
      expect(
        rootReducer(initState, { type: 'updateConfiguration', payload })
          .experiment.extras.experimentSuggestionCount
      ).toEqual(4)
    })

    it('should not change suggested experiments when changing initial points to something less than length of data points', () => {
      const payload: OptimizerConfig = {
        ...emptyExperiment.optimizerConfig,
        initialPoints: 2,
      }
      const testState: State = {
        ...initState,
        experiment: {
          ...initState.experiment,
          extras: {
            experimentSuggestionCount: 1,
          },
          dataPoints: createDataPoints(3),
        },
      }

      expect(
        rootReducer(testState, { type: 'updateConfiguration', payload })
          .experiment.extras.experimentSuggestionCount
      ).toEqual(1)
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
          ...initState.experiment,
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

      expect(rootReducer(initState, action).experiment.dataPoints).toEqual(
        payload
      )
    })

    it('should set suggested experiments to 1 when adding the nth data point where n = initial points', () => {
      const payload: DataEntry[] = createDataPoints(3)

      const action: ExperimentAction = {
        type: 'updateDataPoints',
        payload,
      }

      const testState = {
        ...initState,
        experiment: {
          ...initState.experiment,
          extras: { experimentSuggestionCount: 3 },
        },
      }
      expect(
        rootReducer(testState, action).experiment.extras
          .experimentSuggestionCount
      ).toEqual(1)
    })

    it('should set suggested experiments to initial points when removing the nth data point where n = initial points', () => {
      const payload: DataEntry[] = createDataPoints(2)

      const action: ExperimentAction = {
        type: 'updateDataPoints',
        payload,
      }

      const testState = {
        ...initState,
        experiment: {
          ...initState.experiment,
          dataPoints: createDataPoints(3),
          extras: { experimentSuggestionCount: 1 },
        },
      }
      expect(
        rootReducer(testState, action).experiment.extras
          .experimentSuggestionCount
      ).toEqual(3)
    })

    it.each(new Array(100).fill(0))(
      'should sort data points according to variable definitions',
      () => {
        const values = ['value1', 'value2', 'value3']
        const cats = ['cat1', 'cat2', 'cat3']
        const scores = ['score1', 'score2']

        const testState = produce(initState, draft => {
          draft.experiment.valueVariables = values.map(name => ({
            name,
            description: '',
            max: 100,
            min: 0,
            type: 'continuous',
          }))
          draft.experiment.categoricalVariables = cats.map(name => ({
            name,
            description: '',
            options: ['test'],
          }))
          draft.experiment.scoreVariables = scores.map(name => ({
            name,
            description: '',
            enabled: true,
          }))
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
          'score1',
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
})

const createDataPoints = (
  count: number,
  values = ['Water'],
  categorical = ['Icing'],
  scores = ['score'],
  randomize = false
): DataEntry[] => {
  const valueData: DataPointType[] = values.map(name => ({
    name,
    type: 'numeric',
    value: randomize ? Math.random() * 100 : 100,
  }))
  const categoricalData: DataPointType[] = categorical.map(name => ({
    name,
    type: 'categorical',
    value: 'Vanilla',
  }))
  const scoreData: DataPointType[] = scores.map(name => ({
    name,
    type: 'score',
    value: randomize ? Math.random() * 10 : 2,
  }))
  return [...Array(count)].map((_id, idx) => ({
    meta: { enabled: true, id: idx + 1, valid: true },
    data: valueData.concat(categoricalData, scoreData),
  }))
}
