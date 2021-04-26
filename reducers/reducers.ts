import { State } from "../store"
import { ExperimentType, OptimizerConfig, ExperimentResultType, DataPointType, VariableType } from "../types/common"

export const EXPERIMENT_UPDATED = 'EXPERIMENT_SAVED'
export const EXPERIMENT_NAME_UPDATED = 'EXPERIMENT_NAME_UPDATED'
export const EXPERIMENT_DESCRIPTION_UPDATED = 'EXPERIMENT_DESCRIPTION_UPDATED'
export const VALUE_VARIABLE_ADDED = 'VALUE_VARIABLE_ADDED'
export const VALUE_VARIABLE_DELETED = 'VALUE_VARIABLE_DELETED'
export const CATEGORICAL_VARIABLE_ADDED = 'CATEGORICAL_VARIABLE_ADDED'
export const CATEGORICAL_VARIABLE_DELETED = 'CATEGORICAL_VARIABLE_DELETED'
export const CONFIGURATION_UPDATED = 'CONFIGURATION_UPDATED'
export const RESULT_REGISTERED = 'RESULT_REGISTERED'
export const DATA_POINTS_ADDED = 'DATA_POINTS_ADDED'
export const DATA_POINTS_UPDATED = 'DATA_POINTS_EDITED'

export type ResultRegisteredAction = {
  type: typeof RESULT_REGISTERED
  payload: ExperimentResultType
}

export type CategoricalVariableAddedAction = {
  type: typeof CATEGORICAL_VARIABLE_ADDED
  payload: VariableType
}

export type CategoricalVariableDeletedAction = {
  type: typeof CATEGORICAL_VARIABLE_DELETED
  payload: VariableType
}

export type ValueVariableAddedAction = {
  type: typeof VALUE_VARIABLE_ADDED
  payload: VariableType
}

export type ValueVariableDeletedAction = {
  type: typeof VALUE_VARIABLE_DELETED
  payload: VariableType
}

export type ExperimentUpdatedAction = {
  type: typeof EXPERIMENT_UPDATED
  payload: ExperimentType
}

export type ExperimentNameUpdatedAction = {
  type: typeof EXPERIMENT_NAME_UPDATED
  payload: string
}

export type ExperimentDescriptionUpdatedAction = {
  type: typeof EXPERIMENT_DESCRIPTION_UPDATED
  payload: string
}

export type ConfigurationUpdatedAction = {
  type: typeof CONFIGURATION_UPDATED
  payload: OptimizerConfig
}

export type DataPointsAddedAction = {
  type: typeof DATA_POINTS_ADDED
  payload: DataPointType[]
}

export type DataPointsUpdatedAction = {
  type: typeof DATA_POINTS_UPDATED
  payload: DataPointType[][]
}

export type Action = ExperimentAction
type ExperimentAction = 
    CategoricalVariableAddedAction 
  | CategoricalVariableDeletedAction 
  | ValueVariableAddedAction 
  | ValueVariableDeletedAction 
  | ExperimentUpdatedAction 
  | ExperimentNameUpdatedAction 
  | ExperimentDescriptionUpdatedAction
  | ConfigurationUpdatedAction
  | ResultRegisteredAction
  | DataPointsAddedAction
  | DataPointsUpdatedAction

export const rootReducer = (state: State, action: Action) => {
  switch (action.type) {
    case EXPERIMENT_UPDATED:
    case EXPERIMENT_NAME_UPDATED:
    case EXPERIMENT_DESCRIPTION_UPDATED:
    case CATEGORICAL_VARIABLE_ADDED:
    case CATEGORICAL_VARIABLE_DELETED:
    case VALUE_VARIABLE_ADDED:
    case VALUE_VARIABLE_DELETED:
    case CONFIGURATION_UPDATED:
    case RESULT_REGISTERED:
    case DATA_POINTS_ADDED:
    case DATA_POINTS_UPDATED:
      return {
        ...state,
        experiment: experimentReducer(state.experiment, action)
      }
    default: 
      return state
  }
}

const experimentReducer = (experimentState: ExperimentType, action: ExperimentAction) => {
  switch (action.type) {
    case EXPERIMENT_UPDATED:
      return {
        ...action.payload
      }
    case EXPERIMENT_NAME_UPDATED:
      return {
        ...experimentState,
        info: {
          ...experimentState.info,
          name: action.payload
        }
      }
    case EXPERIMENT_DESCRIPTION_UPDATED:
      return {
        ...experimentState,
        info: {
          ...experimentState.info,
          description: action.payload
        }
      }
    case VALUE_VARIABLE_ADDED:
      let varsAfterAdd: VariableType[] = experimentState.valueVariables.slice()
      varsAfterAdd.splice(experimentState.valueVariables.length, 0, action.payload)
      return {
        ...experimentState,
        valueVariables: varsAfterAdd
      }
    case VALUE_VARIABLE_DELETED:
      let varsAfterDelete: VariableType[] = experimentState.valueVariables.slice()
      let indexOfDelete = experimentState.valueVariables.indexOf(action.payload)
      varsAfterDelete.splice(indexOfDelete, 1)
      return {
        ...experimentState,
        valueVariables: varsAfterDelete
      }
    case CATEGORICAL_VARIABLE_ADDED:
      let catVarsAfterAdd: VariableType[] = experimentState.categoricalVariables.slice()
      catVarsAfterAdd.splice(experimentState.categoricalVariables.length, 0, action.payload)
      return {
        ...experimentState,
        categoricalVariables: catVarsAfterAdd
      }
    case CATEGORICAL_VARIABLE_DELETED:
      let catVarsAfterDelete: VariableType[] = experimentState.categoricalVariables.slice()
      let indexOfCatDelete = experimentState.categoricalVariables.indexOf(action.payload)
      catVarsAfterDelete.splice(indexOfCatDelete, 1)
      return {
        ...experimentState,
        categoricalVariables: catVarsAfterDelete
      }
    case CONFIGURATION_UPDATED:
      return {
        ...experimentState,
        optimizerConfig: action.payload
      }
    case RESULT_REGISTERED:
      return {
        ...experimentState,
        results: action.payload
      }
    case DATA_POINTS_UPDATED:
      return {
        ...experimentState,
        dataPoints: action.payload
      }
  }
}