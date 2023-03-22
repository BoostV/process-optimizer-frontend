import { ExperimentType } from '@core/common'
import produce from 'immer'
import { ValidationViolations } from './validation'

export const validationReducer = produce(
  (state: ExperimentType, violations: ValidationViolations): ExperimentType => {
    return {
      ...state,
      dataPoints: state.dataPoints.map(dp => ({
        ...dp,
        meta: {
          ...dp.meta,
          enabled:
            !violations.dataPointsUndefined.includes(dp.meta.id) &&
            !violations.lowerBoundary.includes(dp.meta.id) &&
            !violations.upperBoundary.includes(dp.meta.id) &&
            !violations.duplicateDataPointIds.includes(dp.meta.id) &&
            !violations.dataPointsNotNumber.includes(dp.meta.id) &&
            violations.duplicateVariableNames.length === 0,
        },
      })),
    }
  }
)
