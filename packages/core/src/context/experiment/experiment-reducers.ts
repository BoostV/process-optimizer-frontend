import {
  CategoricalVariableType,
  DataEntry,
  ExperimentResultType,
  ExperimentType,
  OptimizerConfig,
  ScoreVariableType,
  ValueVariableType,
  experimentSchema,
} from '@core/common/types'
import { produce } from 'immer'
import md5 from 'md5'
import { versionInfo } from '@core/common'
import { assertUnreachable } from '@core/common/util'
import { selectNextValues } from './experiment-selectors'
import { createFetchExperimentResultRequest } from '@core/context/experiment/api'

const calculateInitialPoints = (state: ExperimentType) =>
  Math.max(
    5,
    state.categoricalVariables.length + state.valueVariables.length + 1
  )

const defaultSorted = (
  values: ValueVariableType[],
  categorical: CategoricalVariableType[],
  scores: ScoreVariableType[],
  dataRows: DataEntry[]
) => {
  const orderedNames = values
    .map(v => v.name)
    .concat(categorical.map(v => v.name))
    .concat(scores.map(v => v.name))
  return dataRows.map(dr => ({
    ...dr,
    data: [...dr.data].sort(
      (a, b) =>
        orderedNames.findIndex(n => n === a.name) -
        orderedNames.findIndex(n => n === b.name)
    ),
  }))
}

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
        newVariable: CategoricalVariableType
      }
    }
  | {
      type: 'setCategoricalVariableEnabled'
      payload: {
        index: number
        enabled: boolean
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
        newVariable: ValueVariableType
      }
    }
  | {
      type: 'setValueVariableEnabled'
      payload: {
        index: number
        enabled: boolean
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
        return experimentSchema.parse({
          ...action.payload,
          info: { ...action.payload.info, swVersion: versionInfo.version },
        })
      case 'updateExperimentName':
        state.info.name = experimentSchema.shape.info.shape.name.parse(
          action.payload
        )
        break
      case 'updateExperimentDescription':
        state.info.description =
          experimentSchema.shape.info.shape.description.parse(action.payload)
        break
      case 'updateSuggestionCount':
        state.extras.experimentSuggestionCount = Number(action.payload)
        break
      case 'copySuggestedToDataPoints': {
        const nextValues = selectNextValues(state)
        const variables = state.valueVariables
          .map(v => ({ name: v.name, type: 'numeric' }))
          .concat(
            state.categoricalVariables.map(c => ({
              name: c.name,
              type: 'categorical',
            }))
          )
        const newEntries: DataEntry[] = nextValues
          .filter((_, i) => action.payload.includes(i))
          .map((n, k) => ({
            meta: {
              enabled: true,
              valid: false,
              id:
                state.dataPoints.length === 0
                  ? k + 1
                  : Math.max(...state.dataPoints.map(d => d.meta.id)) + k + 1,
            },
            data: n.map((v, i) => {
              const variable = variables[i]
              if (variable !== undefined) {
                switch (variable.type) {
                  case 'numeric':
                    return {
                      name: variable.name,
                      value: Number(v),
                      type: 'numeric',
                    }
                  case 'categorical':
                    return {
                      name: variable.name,
                      value: String(v),
                      type: 'categorical',
                    }
                }
              }
              throw new Error(
                `Could not find match for index ${i} of ${JSON.stringify(n)}`
              )
            }),
          }))
        state.dataPoints.push(
          ...defaultSorted(
            state.valueVariables,
            state.categoricalVariables,
            state.scoreVariables,
            newEntries
          )
        )
        break
      }
      case 'addValueVariable':
        state.valueVariables.splice(
          state.valueVariables.length,
          0,
          experimentSchema.shape.valueVariables.element.parse(action.payload)
        )
        state.optimizerConfig.initialPoints = calculateInitialPoints(state)
        state.extras.experimentSuggestionCount =
          state.optimizerConfig.initialPoints
        break
      case 'editValueVariable': {
        const oldVariable = state.valueVariables[action.payload.index]
        const newVariable = action.payload.newVariable
        state.valueVariables[action.payload.index] =
          experimentSchema.shape.valueVariables.element.parse({
            ...newVariable,
            min:
              newVariable.type === 'discrete'
                ? Math.round(newVariable.min)
                : newVariable.min,
            max:
              newVariable.type === 'discrete'
                ? Math.round(newVariable.max)
                : newVariable.max,
          })
        if (oldVariable !== undefined) {
          state.dataPoints = updateDataPointNamesAndValues(
            state,
            oldVariable,
            action.payload.newVariable
          )
        }
        break
      }
      case 'deleteValueVariable': {
        const oldValueVariables = [...state.valueVariables]
        state.valueVariables.splice(action.payload, 1)
        state.optimizerConfig.initialPoints = calculateInitialPoints(state)
        state.extras.experimentSuggestionCount =
          state.optimizerConfig.initialPoints
        state.dataPoints = removeDataPoints(
          state,
          action.payload,
          oldValueVariables
        )
        break
      }
      case 'setValueVariableEnabled': {
        const valueVariable = state.valueVariables[action.payload.index]
        if (valueVariable !== undefined) {
          state.valueVariables[action.payload.index] = {
            ...valueVariable,
            enabled: action.payload.enabled,
          }
        }
        break
      }
      case 'addCategorialVariable':
        state.categoricalVariables.splice(
          state.categoricalVariables.length,
          0,
          experimentSchema.shape.categoricalVariables.element.parse(
            action.payload
          )
        )
        state.optimizerConfig.initialPoints = calculateInitialPoints(state)
        state.extras.experimentSuggestionCount =
          state.optimizerConfig.initialPoints
        break
      case 'editCategoricalVariable': {
        const oldVariableName =
          state.categoricalVariables[action.payload.index]?.name
        state.categoricalVariables[action.payload.index] =
          experimentSchema.shape.categoricalVariables.element.parse(
            action.payload.newVariable
          )
        if (oldVariableName !== undefined) {
          state.dataPoints = updateDataPointNames(
            state,
            oldVariableName,
            action.payload.newVariable.name
          )
        }
        break
      }
      case 'deleteCategorialVariable': {
        const oldCategoricalVariables = [...state.categoricalVariables]
        state.categoricalVariables.splice(action.payload, 1)
        state.optimizerConfig.initialPoints = calculateInitialPoints(state)
        state.extras.experimentSuggestionCount =
          state.optimizerConfig.initialPoints
        state.dataPoints = removeDataPoints(
          state,
          action.payload,
          oldCategoricalVariables
        )
        break
      }
      case 'setCategoricalVariableEnabled': {
        const catVariable = state.categoricalVariables[action.payload.index]
        if (catVariable !== undefined) {
          state.categoricalVariables[action.payload.index] = {
            ...catVariable,
            enabled: action.payload.enabled,
          }
        }
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
        state.optimizerConfig = experimentSchema.shape.optimizerConfig.parse(
          action.payload
        )
        break
      case 'registerResult':
        state.lastEvaluationHash = md5(
          JSON.stringify(createFetchExperimentResultRequest(state))
        )
        state.results = experimentSchema.shape.results.parse(action.payload)
        break
      case 'updateDataPoints':
        experimentSchema.shape.dataPoints.parse(action.payload)
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
        state.dataPoints = defaultSorted(
          state.valueVariables,
          state.categoricalVariables,
          state.scoreVariables,
          action.payload
        )
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
                dp.push({ type: 'score', name: scoreName, value: 0 })
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

const updateDataPointNames = (
  state: ExperimentType,
  oldVariableName: string,
  newVariableName: string
) => {
  return state.dataPoints.map(d => {
    const data = d.data.map(point =>
      point.name === oldVariableName
        ? { ...point, name: newVariableName }
        : point
    )
    return {
      ...d,
      data,
    }
  })
}

const updateDataPointNamesAndValues = (
  state: ExperimentType,
  oldVariable: ValueVariableType,
  newVariable: ValueVariableType
) => {
  return state.dataPoints.map(d => {
    const data = d.data.map(point => {
      if (point.type === 'numeric') {
        return oldVariable.name === point.name
          ? {
              ...point,
              name: newVariable.name,
              value:
                newVariable.type === 'discrete'
                  ? Math.round(Number(point.value))
                  : point.value,
            }
          : point
      }
      return point
    })
    return {
      ...d,
      data,
    }
  })
}

const removeDataPoints = (
  state: ExperimentType,
  index: number,
  oldVariables: (CategoricalVariableType | ValueVariableType)[]
) => {
  if (
    state.categoricalVariables.length === 0 &&
    state.valueVariables.length === 0
  ) {
    return []
  } else {
    return state.dataPoints.map(dp => ({
      ...dp,
      data: dp.data.filter(d => d.name !== oldVariables[index]?.name),
    }))
  }
}
