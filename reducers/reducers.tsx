import { CategoricalVariable, ValueVariable, Experiment, Info } from "../pages/experiment/[experimentid]"

export type CategoricalVariableAddedAction = {
  type: 'CATEGORICAL_VARIABLE_ADDED',
  payload: CategoricalVariable 
}

export type ValueVariableAddedAction = {
  type: 'VALUE_VARIABLE_ADDED',
  payload: ValueVariable
}

export type InfoAddedAction = {
  type: 'INFO_ADDED',
  payload: Info
}

export type Action = CategoricalVariableAddedAction | ValueVariableAddedAction | InfoAddedAction

export const experimentReducer = (state: Experiment, action: Action) => {
  if (action.type == 'CATEGORICAL_VARIABLE_ADDED') {
    let newCategoricalVariables = state.categoricalVariables
    newCategoricalVariables.push(action.payload)
    console.log('state', {
      ...state,
      categoricalVariables: newCategoricalVariables
    })
    return {
      ...state,
      categoricalVariables: newCategoricalVariables
    }
  }
  if (action.type === 'INFO_ADDED') {
    return {
      ...state,
      info: action.payload
    }
  }
}