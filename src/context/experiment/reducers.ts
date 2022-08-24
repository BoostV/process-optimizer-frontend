import { State } from '@/context/experiment/store'
import { assertUnreachable } from '@/utility'
import { ExperimentAction, experimentReducer } from './experiment-reducers'

export type Action = ExperimentAction

export type Dispatch = (action: Action) => void

export const rootReducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'setSwVersion':
    case 'updateSuggestionCount':
    case 'updateExperiment':
    case 'updateExperimentName':
    case 'updateExperimentDescription':
    case 'addCategorialVariable':
    case 'deleteCategorialVariable':
    case 'addValueVariable':
    case 'deleteValueVariable':
    case 'updateConfiguration':
    case 'registerResult':
    case 'updateDataPoints':
    case 'experiment/toggleMultiObjective':
      return {
        ...state,
        experiment: experimentReducer(state.experiment, action),
      }
    default:
      assertUnreachable(action)
  }
}
