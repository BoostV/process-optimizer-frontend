import { State } from "../store"
import { ValueVariableType, ExperimentType, CategoricalVariableType } from "../types/common"

export const EXPERIMENT_UPDATED = 'EXPERIMENT_SAVED'
export const EXPERIMENT_NAME_UPDATED = 'EXPERIMENT_NAME_UPDATED'
export const EXPERIMENT_DESCRIPTION_UPDATED = 'EXPERIMENT_DESCRIPTION_UPDATED'
export const VALUE_VARIABLE_ADDED = 'VALUE_VARIABLE_ADDED'
export const CATEGORICAL_VARIABLE_ADDED = 'CATEGORICAL_VARIABLE_ADDED'

export type CategoricalVariableAddedAction = {
  type: typeof CATEGORICAL_VARIABLE_ADDED
  payload: CategoricalVariableType
}

export type ValueVariableAddedAction = {
  type: typeof VALUE_VARIABLE_ADDED
  payload: ValueVariableType
}

export type ExperimentUpdatedAction = {
  type: typeof EXPERIMENT_UPDATED
  payload: ExperimentType
}

export type ExperimentNameUpdatedAction = {
  type: typeof EXPERIMENT_NAME_UPDATED
  payload: String
}

export type ExperimentDescriptionUpdatedAction = {
  type: typeof EXPERIMENT_DESCRIPTION_UPDATED
  payload: String
}

export type Action = ExperimentAction
type ExperimentAction = CategoricalVariableAddedAction | ValueVariableAddedAction | ExperimentUpdatedAction | ExperimentNameUpdatedAction | ExperimentDescriptionUpdatedAction

export const rootReducer = (state: State, action: Action) => {
  switch (action.type) {
    case EXPERIMENT_UPDATED:
    case EXPERIMENT_NAME_UPDATED:
    case EXPERIMENT_DESCRIPTION_UPDATED:
      return {
        ...state,
        experiment: experimentReducer(state.experiment, action)
      }
    case CATEGORICAL_VARIABLE_ADDED:
    case VALUE_VARIABLE_ADDED:
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
      //TODO: Fix shallow copy issue
      let newValueVariables = experimentState.valueVariables
      newValueVariables.push(action.payload)
      return {
        ...experimentState,
        valueVariables: newValueVariables
      }
  }
}