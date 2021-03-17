import { CategoricalVariable, ValueVariable, Experiment, Info, LoadedExperiment } from "../pages/experiment/[experimentid]"

export type CategoricalVariableAddedAction = {
  type: 'CATEGORICAL_VARIABLE_ADDED',
  payload: CategoricalVariable 
}

export type ValueVariableAddedAction = {
  type: 'VALUE_VARIABLE_ADDED',
  payload: ValueVariable
}

export type InfoAddedAction = {
  type: 'EXPERIMENT_SAVED',
  payload: Info
}

export type ExperimentLoadedAction = {
  type: 'EXPERIMENT_LOADED',
  payload: LoadedExperiment
}

export type Action = CategoricalVariableAddedAction | ValueVariableAddedAction | InfoAddedAction | ExperimentLoadedAction

export const experimentReducer = (state: Experiment, action: Action) => {
  switch (action.type) {
    case 'EXPERIMENT_LOADED':
      return {
        ...state,
        id: action.payload.id,
      }
    case 'CATEGORICAL_VARIABLE_ADDED':
      let newCategoricalVariables = state.categoricalVariables
      newCategoricalVariables.push(action.payload)
      return {
        ...state,
        categoricalVariables: newCategoricalVariables
      }
    case 'EXPERIMENT_SAVED':
      return {
        ...state,
        info: action.payload
      }
    default: 
      return state
  }
}