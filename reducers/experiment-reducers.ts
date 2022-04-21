import { versionInfo } from '../components/version-info'
import {
  CategoricalVariableType,
  DataPointType,
  ExperimentResultType,
  ExperimentType,
  OptimizerConfig,
  ValueVariableType,
} from '../types/common'
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
      type: 'addDataPoints'
      payload: DataPointType[]
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
  | {
      type: 'experiment/toggleShowConfidence'
    }

export const experimentReducer = (
  experimentState: ExperimentType,
  action: ExperimentAction
): ExperimentType => {
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
      return {
        ...experimentState,
        valueVariables: varsAfterAdd,
      }
    case 'deleteValueVariable':
      let varsAfterDelete: ValueVariableType[] =
        experimentState.valueVariables.slice()
      let indexOfDelete = experimentState.valueVariables.indexOf(action.payload)
      varsAfterDelete.splice(indexOfDelete, 1)
      return {
        ...experimentState,
        valueVariables: varsAfterDelete,
      }
    case 'addCategorialVariable':
      let catVarsAfterAdd: CategoricalVariableType[] =
        experimentState.categoricalVariables.slice()
      catVarsAfterAdd.splice(
        experimentState.categoricalVariables.length,
        0,
        action.payload
      )
      return {
        ...experimentState,
        categoricalVariables: catVarsAfterAdd,
      }
    case 'deleteCategorialVariable':
      let catVarsAfterDelete: CategoricalVariableType[] =
        experimentState.categoricalVariables.slice()
      let indexOfCatDelete = experimentState.categoricalVariables.indexOf(
        action.payload
      )
      catVarsAfterDelete.splice(indexOfCatDelete, 1)
      return {
        ...experimentState,
        categoricalVariables: catVarsAfterDelete,
      }
    case 'updateConfiguration':
      return {
        ...experimentState,
        optimizerConfig: action.payload,
      }
    case 'registerResult':
      return {
        ...experimentState,
        results: action.payload,
      }
    case 'updateDataPoints':
      return {
        ...experimentState,
        dataPoints: action.payload,
      }
    case 'experiment/toggleMultiObjective':
      const newState = {
        ...experimentState,
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
    case 'experiment/toggleShowConfidence':
      return {
        ...experimentState,
        extras: {
          ...experimentState.extras,
          includeConfidence: !(
            experimentState.extras['includeConfidence'] ?? false
          ),
        },
      }
      return newState
  }
}
