import { State } from "../store"
import { ExperimentAction, experimentReducer } from "./experiment-reducers"

export type Action = ExperimentAction 

export type Dispatch = (action: Action) => void

export const rootReducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'updateExperiment':
    case 'updateExperimentName':
    case 'updateExperimentDescription':
    case 'addCategorialVariable':
    case 'deleteCategorialVariable':
    case 'addValueVariable':
    case 'deleteValueVariable':
    case 'updateConfiguration':
    case 'registerResult':
    case 'addDataPoints':
    case 'updateDataPoints':
      return {
        ...state,
        experiment: experimentReducer(state.experiment, action)
      }
    default:
      return state
  }
}
