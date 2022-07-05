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

export const experimentReducer = (
  experimentState: ExperimentType,
  action: ExperimentAction
): ExperimentType => {
  let newState = experimentState
  switch (action.type) {
    case 'setSwVersion':
      return {
        ...experimentState,
        info: {
          ...experimentState.info,
          swVersion: action.payload,
        },
      }
    case 'updateExperiment':
      return {
        ...action.payload,
        info: { ...action.payload.info, swVersion: versionInfo.version },
      }
    case 'updateExperimentName':
      return {
        ...experimentState,
        info: {
          ...experimentState.info,
          name: action.payload,
        },
      }
    case 'updateExperimentDescription':
      return {
        ...experimentState,
        info: {
          ...experimentState.info,
          description: action.payload,
        },
      }
    case 'updateSuggestionCount':
      return {
        ...experimentState,
        changedSinceLastEvaluation: true,
        extras: {
          ...experimentState.extras,
          experimentSuggestionCount: Number(action.payload),
        },
      }
    case 'addValueVariable':
      let varsAfterAdd: ValueVariableType[] =
        experimentState.valueVariables.slice()
      varsAfterAdd.splice(
        experimentState.valueVariables.length,
        0,
        action.payload
      )
      newState = {
        ...experimentState,
        changedSinceLastEvaluation: true,
        valueVariables: varsAfterAdd,
      }
      return {
        ...newState,
        optimizerConfig: {
          ...experimentState.optimizerConfig,
          initialPoints: calculateInitialPoints(newState),
        },
      }
    case 'deleteValueVariable':
      let varsAfterDelete: ValueVariableType[] =
        experimentState.valueVariables.slice()
      let indexOfDelete = experimentState.valueVariables.indexOf(action.payload)
      varsAfterDelete.splice(indexOfDelete, 1)
      newState = {
        ...experimentState,
        changedSinceLastEvaluation: true,
        valueVariables: varsAfterDelete,
      }
      return {
        ...newState,
        optimizerConfig: {
          ...experimentState.optimizerConfig,
          initialPoints: calculateInitialPoints(newState),
        },
      }
    case 'addCategorialVariable':
      let catVarsAfterAdd: CategoricalVariableType[] =
        experimentState.categoricalVariables.slice()
      catVarsAfterAdd.splice(
        experimentState.categoricalVariables.length,
        0,
        action.payload
      )
      newState = {
        ...experimentState,
        changedSinceLastEvaluation: true,
        categoricalVariables: catVarsAfterAdd,
      }
      return {
        ...newState,
        optimizerConfig: {
          ...experimentState.optimizerConfig,
          initialPoints: calculateInitialPoints(newState),
        },
      }
    case 'deleteCategorialVariable':
      let catVarsAfterDelete: CategoricalVariableType[] =
        experimentState.categoricalVariables.slice()
      let indexOfCatDelete = experimentState.categoricalVariables.indexOf(
        action.payload
      )
      catVarsAfterDelete.splice(indexOfCatDelete, 1)
      newState = {
        ...experimentState,
        changedSinceLastEvaluation: true,
        categoricalVariables: catVarsAfterDelete,
      }
      return {
        ...newState,
        optimizerConfig: {
          ...experimentState.optimizerConfig,
          initialPoints: calculateInitialPoints(newState),
        },
      }
    case 'updateConfiguration':
      if (
        action.payload.initialPoints !==
          experimentState.optimizerConfig.initialPoints &&
        experimentState.dataPoints.length < action.payload.initialPoints
      ) {
        newState = {
          ...newState,
          extras: {
            ...newState.extras,
            experimentSuggestionCount: action.payload.initialPoints,
          },
        }
      }
      return {
        ...newState,
        changedSinceLastEvaluation: true,
        optimizerConfig: action.payload,
      }
    case 'registerResult':
      return {
        ...experimentState,
        changedSinceLastEvaluation: false,
        results: action.payload,
      }
    case 'updateDataPoints':
      if (
        action.payload.length < experimentState.dataPoints.length &&
        experimentState.dataPoints.length ===
          experimentState.optimizerConfig.initialPoints
      ) {
        newState = {
          ...newState,
          extras: {
            ...newState.extras,
            experimentSuggestionCount:
              experimentState.optimizerConfig.initialPoints,
          },
        }
      }
      if (
        action.payload.length >=
          experimentState.optimizerConfig.initialPoints &&
        experimentState.dataPoints.length <
          experimentState.optimizerConfig.initialPoints
      ) {
        newState = {
          ...newState,
          extras: { ...newState.extras, experimentSuggestionCount: 1 },
        }
      }
      return {
        ...newState,
        changedSinceLastEvaluation: true,
        dataPoints: action.payload,
      }
    case 'experiment/toggleMultiObjective':
      newState = {
        ...experimentState,
        changedSinceLastEvaluation: true,
        scoreVariables: experimentState.scoreVariables.map((it, idx) => ({
          ...it,
          enabled: idx < 1 || !it.enabled,
        })),
      }
      if (newState.scoreVariables.length < 2) {
        newState.scoreVariables.push({
          name: 'score2',
          description: 'score 2',
          enabled: true,
        })
        const scoreNames = newState.scoreVariables.map(it => it.name)
        newState.dataPoints.forEach(dp => {
          const containedScores = dp
            .filter(it => scoreNames.includes(it.name))
            .map(it => it.name)
          scoreNames.forEach(scoreName => {
            if (!containedScores.includes(scoreName))
              dp.push({ name: scoreName, value: '0' })
          })
        })
      }
      return newState
    default:
      assertUnreachable(action)
  }
}
