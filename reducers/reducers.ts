import { State } from "../store"
import { CategoricalVariable, ExperimentType, Info, ValueVariable } from "../types/common"

export const EXPERIMENT_LOADED = 'EXPERIMENT_LOADED'
export const EXPERIMENT_SAVED = 'EXPERIMENT_SAVED'
export const CATEGORICAL_VARIABLE_ADDED = 'CATEGORICAL_VARIABLE_ADDED'
export const VALUE_VARIABLE_ADDED = 'VALUE_VARIABLE_ADDED'

export type CategoricalVariableAddedAction = {
  type: typeof CATEGORICAL_VARIABLE_ADDED,
  payload: CategoricalVariable 
}

export type ValueVariableAddedAction = {
  type: typeof VALUE_VARIABLE_ADDED,
  payload: ValueVariable
}

export type InfoAddedAction = {
  type: typeof EXPERIMENT_SAVED,
  payload: Info
}

export type ExperimentLoadedAction = {
  type: typeof EXPERIMENT_LOADED,
  payload: ExperimentType
}

export type Action = ExperimentAction
type ExperimentAction = CategoricalVariableAddedAction | ValueVariableAddedAction | InfoAddedAction | ExperimentLoadedAction

export const rootReducer = (state: State, action: Action) => {
  switch (action.type) {
    //TODO Something like "action in ExperimentAction" instead of ||
    case EXPERIMENT_LOADED || EXPERIMENT_SAVED || CATEGORICAL_VARIABLE_ADDED || VALUE_VARIABLE_ADDED:
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
    case EXPERIMENT_LOADED:
      return {
        ...action.payload
      }
    case CATEGORICAL_VARIABLE_ADDED:
      //TODO: Fix shallow copy issue
      let newCategoricalVariables = experimentState.categoricalVariables
      newCategoricalVariables.push(action.payload)
      return {
        ...experimentState,
        categoricalVariables: newCategoricalVariables
      }
    case EXPERIMENT_SAVED:
      return {
        ...experimentState,
        info: action.payload
      }
  }
}