import { assertUnreachable } from '@core/common/util'
import { State } from './store'
import {
  ExperimentAction,
  experimentReducer,
  invalidateStaleParetoSelection,
  resetSuggestionCountOnModelFit,
} from './experiment-reducers'
import { validateExperiment, ValidationViolations } from './validation'
import { validationReducer } from './validation-reducer'
import { calculateChangeReducer } from './calculate-change-reducer'

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
    case 'setSelectedParetoPoint':
    case 'updateDataPoints':
    case 'copySuggestedToDataPoints':
    case 'experiment/toggleMultiObjective':
    case 'experiment/setConstraintSum':
    case 'experiment/addVariableToConstraintSum':
    case 'experiment/removeVariableFromConstraintSum':
    case 'updateScoreFunction':
    case 'updateDataPointResponses':
    case 'setDataPointsUseFunction': {
      const experiment = experimentReducer(state.experiment, action)
      const validationViolations: ValidationViolations =
        validateExperiment(experiment)
      const validated = validationReducer(experiment, validationViolations)
      // Selection invalidation runs post-validation: meta.valid is only set by
      // the validation reducer, and the active-data comparison depends on it.
      const selectionChecked = invalidateStaleParetoSelection(
        state.experiment,
        validated,
        action
      )
      return {
        ...state,
        experiment: calculateChangeReducer(
          resetSuggestionCountOnModelFit(state.experiment, selectionChecked)
        ),
      }
    }
    default:
      assertUnreachable(action)
  }
}
