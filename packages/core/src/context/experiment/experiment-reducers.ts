import {
  CategoricalVariableType,
  DataEntry,
  ExperimentResultType,
  ExperimentType,
  OptimizerConfig,
  ValueVariableType,
} from '@core/common/types'
import produce from 'immer'
import { versionInfo } from '@core/common'
import { assertUnreachable } from '@core/common/util'

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
        state.changedSinceLastEvaluation = true
        state.extras.experimentSuggestionCount = Number(action.payload)
        break
      case 'copySuggestedToDataPoints':
        const next =
          state.results.next && Array.isArray(state.results.next[0])
            ? (state.results.next as unknown as any[][])
            : state.results.next
            ? [state.results.next]
            : []
        const variableNames = state.valueVariables
          .map(v => v.name)
          .concat(state.categoricalVariables.map(c => c.name))
        const newEntries: DataEntry[] = next
          .filter((_, i) => action.payload.includes(i))
          .map((n, k) => ({
            meta: {
              enabled: true,
              id: Math.max(...state.dataPoints.map(d => d.meta.id)) + k + 1,
            },
            data: n
              .map((v, i) => ({
                name: variableNames[i] || '',
                value: v,
              }))
              .concat([
                ...state.scoreVariables.map(s => ({
                  name: s.name,
                  value: 0,
                })),
              ]),
          }))
        state.dataPoints.push(...newEntries)
        state.changedSinceLastEvaluation = true
        break
      case 'addValueVariable':
        state.changedSinceLastEvaluation = true
        state.valueVariables.splice(
          state.valueVariables.length,
          0,
          action.payload
        )
        state.optimizerConfig.initialPoints = calculateInitialPoints(state)
        state.extras.experimentSuggestionCount =
          state.optimizerConfig.initialPoints
        break
      case 'deleteValueVariable': {
        state.changedSinceLastEvaluation = true
        const indexOfDelete = state.valueVariables.indexOf(action.payload)
        state.valueVariables.splice(indexOfDelete, 1)
        state.optimizerConfig.initialPoints = calculateInitialPoints(state)
        state.extras.experimentSuggestionCount =
          state.optimizerConfig.initialPoints
        break
      }
      case 'addCategorialVariable':
        state.changedSinceLastEvaluation = true
        state.categoricalVariables.splice(
          state.categoricalVariables.length,
          0,
          action.payload
        )
        state.optimizerConfig.initialPoints = calculateInitialPoints(state)
        state.extras.experimentSuggestionCount =
          state.optimizerConfig.initialPoints
        break
      case 'deleteCategorialVariable': {
        state.changedSinceLastEvaluation = true
        const indexOfCatDelete = state.categoricalVariables.indexOf(
          action.payload
        )
        state.categoricalVariables.splice(indexOfCatDelete, 1)
        state.optimizerConfig.initialPoints = calculateInitialPoints(state)
        state.extras.experimentSuggestionCount =
          state.optimizerConfig.initialPoints
        break
      }
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
          state.dataPoints.forEach(dataEntry => {
            const dp = dataEntry.data
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
