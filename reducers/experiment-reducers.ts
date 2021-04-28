import { CategoricalVariableType, DataPointType, ExperimentResultType, ExperimentType, OptimizerConfig, ValueVariableType } from "../types/common"
export type ExperimentAction =
    | {
        type: 'RESULT_REGISTERED'
        payload: ExperimentResultType
    }
    | {
        type: 'CATEGORICAL_VARIABLE_ADDED'
        payload: CategoricalVariableType
    }
    | {
        type: 'CATEGORICAL_VARIABLE_DELETED'
        payload: CategoricalVariableType
    }
    | {
        type: 'VALUE_VARIABLE_ADDED'
        payload: ValueVariableType
    }
    | {
        type: 'VALUE_VARIABLE_DELETED'
        payload: ValueVariableType
    }
    | {
        type: 'EXPERIMENT_UPDATED'
        payload: ExperimentType
    }
    | {
        type: 'EXPERIMENT_NAME_UPDATED'
        payload: string
    }
    | {
        type: 'EXPERIMENT_DESCRIPTION_UPDATED'
        payload: string
    }
    | {
        type: 'CONFIGURATION_UPDATED'
        payload: OptimizerConfig
    }
    | {
        type: 'DATA_POINTS_ADDED'
        payload: DataPointType[]
    }
    | {
        type: 'DATA_POINTS_UPDATED'
        payload: DataPointType[][]
    }

export const experimentReducer = (experimentState: ExperimentType, action: ExperimentAction) => {
    switch (action.type) {
        case 'EXPERIMENT_UPDATED':
            return {
                ...action.payload
            }
        case 'EXPERIMENT_NAME_UPDATED':
            return {
                ...experimentState,
                info: {
                    ...experimentState.info,
                    name: action.payload
                }
            }
        case 'EXPERIMENT_DESCRIPTION_UPDATED':
            return {
                ...experimentState,
                info: {
                    ...experimentState.info,
                    description: action.payload
                }
            }
        case 'VALUE_VARIABLE_ADDED':
            let varsAfterAdd: ValueVariableType[] = experimentState.valueVariables.slice()
            varsAfterAdd.splice(experimentState.valueVariables.length, 0, action.payload)
            return {
                ...experimentState,
                valueVariables: varsAfterAdd
            }
        case 'VALUE_VARIABLE_DELETED':
            let varsAfterDelete: ValueVariableType[] = experimentState.valueVariables.slice()
            let indexOfDelete = experimentState.valueVariables.indexOf(action.payload)
            varsAfterDelete.splice(indexOfDelete, 1)
            return {
                ...experimentState,
                valueVariables: varsAfterDelete
            }
        case 'CATEGORICAL_VARIABLE_ADDED':
            let catVarsAfterAdd: CategoricalVariableType[] = experimentState.categoricalVariables.slice()
            catVarsAfterAdd.splice(experimentState.categoricalVariables.length, 0, action.payload)
            return {
                ...experimentState,
                categoricalVariables: catVarsAfterAdd
            }
        case 'CATEGORICAL_VARIABLE_DELETED':
            let catVarsAfterDelete: CategoricalVariableType[] = experimentState.categoricalVariables.slice()
            let indexOfCatDelete = experimentState.categoricalVariables.indexOf(action.payload)
            catVarsAfterDelete.splice(indexOfCatDelete, 1)
            return {
                ...experimentState,
                categoricalVariables: catVarsAfterDelete
            }
        case 'CONFIGURATION_UPDATED':
            return {
                ...experimentState,
                optimizerConfig: action.payload
            }
        case 'RESULT_REGISTERED':
            return {
                ...experimentState,
                results: action.payload
            }
        case 'DATA_POINTS_UPDATED':
            return {
                ...experimentState,
                dataPoints: action.payload
            }
    }
}