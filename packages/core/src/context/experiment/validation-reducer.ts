import { ExperimentType } from '@core/common'
import produce from 'immer'
import { ValidationViolations } from './validation'

export const validationReducer = produce(
  (state: ExperimentType, violations: ValidationViolations): ExperimentType => {
    return {
      ...state,
      dataPoints: state.dataPoints.map(dp => {
        const isValid =
          !violations.dataPointsUndefined.includes(dp.meta.id) &&
          !violations.lowerBoundary.includes(dp.meta.id) &&
          !violations.upperBoundary.includes(dp.meta.id) &&
          !violations.duplicateDataPointIds.includes(dp.meta.id) &&
          !violations.dataPointsNotNumber.includes(dp.meta.id) &&
          violations.duplicateVariableNames.length === 0
        return {
          ...dp,
          meta: {
            ...dp.meta,
            valid: isValid,
            enabled: !isValid ? false : dp.meta.enabled,
          },
        }
      }),
    }
  }
)
