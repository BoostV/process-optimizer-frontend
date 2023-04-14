import {
  CategoricalVariableType,
  DataEntry,
  ExperimentResultType,
  ExperimentType,
  OptimizerConfig,
  ValueVariableType,
} from '@core/common/types'
import { produce } from 'immer'
import md5 from 'md5'
import { versionInfo } from '@core/common'
import { assertUnreachable } from '@core/common/util'
import { selectNextValues } from './experiment-selectors'
import { createFetchExperimentResultRequest } from '@core/context/experiment/api'

const calculateInitialPoints = (state: ExperimentType) =>
  Math.max(
    3,
    (state.categoricalVariables.length + state.valueVariables.length) * 3
  )

export type ExperimentAction =
  | {
      type: 'setSwVersion'
      payload: string
    }
  | {
      type: 'registerResult'
      payload: ExperimentResultType
    }
  | {
      type: 'addCategorialVariable'
      payload: CategoricalVariableType
    }
  | {
      type: 'editCategoricalVariable'
      payload: {
        index: number
        variable: CategoricalVariableType
      }
    }
  | {
      type: 'deleteCategorialVariable'
      payload: number
    }
  | {
      type: 'addValueVariable'
      payload: ValueVariableType
    }
  | {
      type: 'editValueVariable'
      payload: {
        index: number
        variable: ValueVariableType
      }
    }
  | {
      type: 'deleteValueVariable'
      payload: number
    }
  | {
      type: 'updateExperiment'
      payload: ExperimentType
    }
  | {
      type: 'updateExperimentName'
      payload: string
    }
  | {
      type: 'updateExperimentDescription'
      payload: string
    }
  | {
      type: 'updateConfiguration'
      payload: OptimizerConfig
    }
  | {
      type: 'updateDataPoints'
      payload: DataEntry[]
    }
  | {
      type: 'updateSuggestionCount'
      payload: string
    }
  | {
      type: 'copySuggestedToDataPoints'
      payload: number[]
    }
  | {
      type: 'experiment/toggleMultiObjective'
    }

export const experimentReducer = produce(
  (state: ExperimentType, action: ExperimentAction): void | ExperimentType => {
    switch (action.type) {
      case 'setSwVersion':
        state.info.swVersion = action.payload
        break
      case 'updateExperiment':
        return {
          ...action.payload,
          info: { ...action.payload.info, swVersion: versionInfo.version },
        }
      case 'updateExperimentName':
        state.info.name = action.payload
        break
      case 'updateExperimentDescription':
        state.info.description = action.payload
        break
      case 'updateSuggestionCount':
        state.extras.experimentSuggestionCount = Number(action.payload)
        break
      case 'copySuggestedToDataPoints':
        const nextValues = selectNextValues(state)
        const variableNames = state.valueVariables
          .map(v => v.name)
          .concat(state.categoricalVariables.map(c => c.name))
        const newEntries: DataEntry[] = nextValues
          .filter((_, i) => action.payload.includes(i))
          .map((n, k) => ({
            meta: {
              enabled: false,
              valid: true,
              id:
                state.dataPoints.length === 0
                  ? k + 1
                  : Math.max(...state.dataPoints.map(d => d.meta.id)) + k + 1,
            },
            data: n
              .map((v, i) => ({
                name: variableNames[i] || '',
                value: v,
              }))
              .concat([
                ...state.scoreVariables.map(s => ({
                  name: s.name,
                  value: undefined,
                })),
              ]),
          }))
        state.dataPoints.push(...newEntries)
        break
      case 'addValueVariable':
        state.valueVariables.splice(
          state.valueVariables.length,
          0,
          action.payload
        )
        state.optimizerConfig.initialPoints = calculateInitialPoints(state)
        state.extras.experimentSuggestionCount =
          state.optimizerConfig.initialPoints
        break
      case 'editValueVariable':
        state.valueVariables[action.payload.index] = action.payload.variable
        break
      case 'deleteValueVariable': {
        state.valueVariables.splice(action.payload, 1)
        state.optimizerConfig.initialPoints = calculateInitialPoints(state)
        state.extras.experimentSuggestionCount =
          state.optimizerConfig.initialPoints
        break
      }
      case 'addCategorialVariable':
        state.categoricalVariables.splice(
          state.categoricalVariables.length,
          0,
          action.payload
        )
        state.optimizerConfig.initialPoints = calculateInitialPoints(state)
        state.extras.experimentSuggestionCount =
          state.optimizerConfig.initialPoints
        break
      case 'editCategoricalVariable':
        state.categoricalVariables[action.payload.index] =
          action.payload.variable
        break
      case 'deleteCategorialVariable': {
        state.categoricalVariables.splice(action.payload, 1)
        state.optimizerConfig.initialPoints = calculateInitialPoints(state)
        state.extras.experimentSuggestionCount =
          state.optimizerConfig.initialPoints
        break
      }
      case 'updateConfiguration':
        if (
          action.payload.initialPoints !==
            state.optimizerConfig.initialPoints &&
          state.dataPoints.length < action.payload.initialPoints
        ) {
          state.extras.experimentSuggestionCount = action.payload.initialPoints
        }
        state.optimizerConfig = action.payload
        break
      case 'registerResult':
        state.lastEvaluationHash = md5(
          JSON.stringify(createFetchExperimentResultRequest(state))
        )
        state.results = action.payload
        break
      case 'updateDataPoints':
        if (
          action.payload.length < state.dataPoints.length &&
          state.dataPoints.length === state.optimizerConfig.initialPoints
        ) {
          state.extras.experimentSuggestionCount =
            state.optimizerConfig.initialPoints
        }
        if (
          action.payload.length >= state.optimizerConfig.initialPoints &&
          state.dataPoints.length < state.optimizerConfig.initialPoints
        ) {
          state.extras.experimentSuggestionCount = 1
        }
        state.dataPoints = action.payload
        break
      case 'experiment/toggleMultiObjective':
        state.scoreVariables = state.scoreVariables.map((it, idx) => ({
          ...it,
          enabled: idx < 1 || !it.enabled,
        }))

        if (state.scoreVariables.length < 2) {
          state.scoreVariables.push({
            name: 'score2',
            description: 'score 2',
            enabled: true,
          })
          const scoreNames = state.scoreVariables.map(it => it.name)
          state.dataPoints.forEach(dataEntry => {
            const dp = dataEntry.data
            const containedScores = dp
              .filter(it => scoreNames.includes(it.name))
              .map(it => it.name)
            scoreNames.forEach(scoreName => {
              if (!containedScores.includes(scoreName))
                dp.push({ name: scoreName, value: 0 })
            })
          })
        }
        break
      default:
        assertUnreachable(action)
    }
    state.changedSinceLastEvaluation =
      state.lastEvaluationHash !==
      md5(JSON.stringify(createFetchExperimentResultRequest(state)))
  }
)
