import { State } from "../store"
import { ExperimentAction, experimentReducer } from "./experiment-reducers"

export type Action = ExperimentAction 

export type Dispatch = (action: Action) => void

export const rootReducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'EXPERIMENT_UPDATED':
    case 'EXPERIMENT_NAME_UPDATED':
    case 'EXPERIMENT_DESCRIPTION_UPDATED':
    case 'CATEGORICAL_VARIABLE_ADDED':
    case 'CATEGORICAL_VARIABLE_DELETED':
    case 'VALUE_VARIABLE_ADDED':
    case 'VALUE_VARIABLE_DELETED':
    case 'CONFIGURATION_UPDATED':
    case 'RESULT_REGISTERED':
    case 'DATA_POINTS_ADDED':
    case 'DATA_POINTS_UPDATED':
      return {
        ...state,
        experiment: experimentReducer(state.experiment, action)
      }
    default:
      return state
  }
}
