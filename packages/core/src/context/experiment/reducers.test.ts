import { ExperimentAction } from './experiment-reducers'
import { rootReducer } from './reducers'
import {
  CategoricalVariableType,
  currentVersion,
  DataEntry,
  ExperimentResultType,
  ExperimentType,
  OptimizerConfig,
  ValueVariableType,
} from '@core/common/types'
import { emptyExperiment, State } from '@core/context/experiment'
import { versionInfo } from '@core/common'

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
          options: [],
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
      scoreVariables: [],
      optimizerConfig: {
        baseEstimator: 'GP',
        acqFunc: 'gp_hedge',
        initialPoints: 3,
        kappa: 1.96,
        xi: 0.01,
      },
      results: {
        id: '',
        next: [],
        plots: [],
        pickled: '',
        expectedMinimum: [],
        extras: {},
      },
      dataPoints: [],
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
        const payload: ValueVariableType = {
          type: 'continuous',
          name: 'Water',
          description: 'Wet',
          min: 100,
          max: 200,
        }

        const action: ExperimentAction = {
          type: 'deleteValueVariable',
          payload,
        }

        expect(
          rootReducer(initState, action).experiment.valueVariables
        ).toEqual([])
      })

      it('should reset initial points and suggestion', async () => {
        const payload: ValueVariableType = {
          type: 'continuous',
          name: 'Water',
          description: 'Wet',
          min: 100,
          max: 200,
        }

        const action: ExperimentAction = {
          type: 'deleteValueVariable',
          payload,
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
            options: [],
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
        const payload: CategoricalVariableType = {
          name: 'Icing',
          description: 'Sugary',
          options: [],
        }

        const action: ExperimentAction = {
          type: 'deleteCategorialVariable',
          payload,
        }

        expect(
          rootReducer(initState, action).experiment.categoricalVariables
        ).toEqual([])
      })

      it('should reset suggestion count and initial points', async () => {
        const payload: CategoricalVariableType = {
          name: 'Icing',
          description: 'Sugary',
          options: [],
        }

        const action: ExperimentAction = {
          type: 'deleteCategorialVariable',
          payload,
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
        next: [1, 2, 3, 'Red'],
        pickled: 'pickled',
        expectedMinimum: [],
        extras: {},
        plots: [{ id: 'sample', plot: 'base64encodedData' }],
      }

      const action: ExperimentAction = {
        type: 'registerResult',
        payload: payload,
      }

      expect(rootReducer(initState, action)).toEqual({
        experiment: {
          ...initState.experiment,
          changedSinceLastEvaluation: false,
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
  })
})

const createDataPoints = (count: number): DataEntry[] =>
  [...Array(count)].map((_id, idx) => ({
    meta: { enabled: true, id: idx + 1 },
    data: [
      {
        name: 'New point 1',
        value: '1',
      },
      {
        name: 'score',
        value: [2],
      },
    ],
  }))
