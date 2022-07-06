import { versionInfo } from '../components/version-info'
import {
  CategoricalVariableType,
  DataPointType,
  ExperimentResultType,
  ExperimentType,
  OptimizerConfig,
  ValueVariableType,
} from '../types/common'
import { assertUnreachable } from '../utility'
import produce from 'immer'

const calculateInitialPoints = (state: ExperimentType) =>
  (state.categoricalVariables.length + state.valueVariables.length) * 3

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
      type: 'deleteCategorialVariable'
      payload: CategoricalVariableType
    }
  | {
      type: 'addValueVariable'
      payload: ValueVariableType
    }
  | {
      type: 'deleteValueVariable'
      payload: ValueVariableType
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
      payload: DataPointType[][]
    }
  | {
      type: 'updateSuggestionCount'
      payload: string
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
        state.changedSinceLastEvaluation = true
        state.extras.experimentSuggestionCount = Number(action.payload)
        break
      case 'addValueVariable':
        state.changedSinceLastEvaluation = true
        state.valueVariables.splice(
          state.valueVariables.length,
          0,
          action.payload
        )
        state.optimizerConfig.initialPoints = calculateInitialPoints(state)
        break
      case 'deleteValueVariable':
        state.changedSinceLastEvaluation = true
        let indexOfDelete = state.valueVariables.indexOf(action.payload)
        state.valueVariables.splice(indexOfDelete, 1)
        state.optimizerConfig.initialPoints = calculateInitialPoints(state)
        break
      case 'addCategorialVariable':
        state.changedSinceLastEvaluation = true
        state.categoricalVariables.splice(
          state.categoricalVariables.length,
          0,
          action.payload
        )
        state.optimizerConfig.initialPoints = calculateInitialPoints(state)
        break
      case 'deleteCategorialVariable':
        state.changedSinceLastEvaluation = true
        let indexOfCatDelete = state.categoricalVariables.indexOf(
          action.payload
        )
        state.categoricalVariables.splice(indexOfCatDelete, 1)
        state.optimizerConfig.initialPoints = calculateInitialPoints(state)
        break
      case 'updateConfiguration':
        state.changedSinceLastEvaluation = true
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
        state.changedSinceLastEvaluation = false
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
        state.changedSinceLastEvaluation = true
        break
      case 'experiment/toggleMultiObjective':
        state.changedSinceLastEvaluation = true
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
          state.dataPoints.forEach(dp => {
            const containedScores = dp
              .filter(it => scoreNames.includes(it.name))
              .map(it => it.name)
            scoreNames.forEach(scoreName => {
              if (!containedScores.includes(scoreName))
                dp.push({ name: scoreName, value: '0' })
            })
          })
        }
        break
      default:
        assertUnreachable(action)
    }
  }
)
