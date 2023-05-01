import { assertUnreachable } from '@core/common/util'
import { State } from './store'
import { ExperimentAction, experimentReducer } from './experiment-reducers'
import { validateExperiment, ValidationViolations } from './validation'
import { validationReducer } from './validation-reducer'

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
    case 'editCategoricalVariable':
    case 'deleteCategorialVariable':
    case 'setCategoricalVariableEnabled':
    case 'addValueVariable':
    case 'editValueVariable':
    case 'deleteValueVariable':
    case 'setValueVariableEnabled':
    case 'updateConfiguration':
    case 'registerResult':
    case 'updateDataPoints':
    case 'copySuggestedToDataPoints':
    case 'experiment/toggleMultiObjective': {
      const experiment = experimentReducer(state.experiment, action)
      const validationViolations: ValidationViolations =
        validateExperiment(experiment)
      return {
        ...state,
        experiment: validationReducer(experiment, validationViolations),
      }
    }
    default:
      assertUnreachable(action)
  }
}
