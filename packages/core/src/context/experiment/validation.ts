import { ExperimentType } from '@core/common'

export type ValidationViolations = {
  upperBoundary: number[]
  lowerBoundary: number[]
  duplicateVariableNames: string[]
  dataPointsUndefined: number[]
  duplicateDataPointIds: number[]
}

export const validateExperiment = (
  experiment: ExperimentType
): ValidationViolations => {
  return {
    upperBoundary: validateUpperBoundary(experiment),
    lowerBoundary: validateLowerBoundary(experiment),
    duplicateVariableNames: validateDuplicateVariableNames(experiment),
    dataPointsUndefined: validateDataPointsUndefined(experiment),
    duplicateDataPointIds: validateDuplicateDataPointIds(experiment),
  }
}

// Needed to ensure that e.g. boundary validation works
export const validateDuplicateVariableNames = (
  experiment: ExperimentType
): string[] => findUniqueDuplicates(experiment.valueVariables.map(v => v.name))

export const validateUpperBoundary = (experiment: ExperimentType): number[] => {
  let violations: number[] = []
  experiment.dataPoints.forEach(dp => {
    dp.data.forEach(d => {
      const valueVarMax = experiment.valueVariables.find(
        v => v.name === d.name
      )?.max
      if (
        valueVarMax !== undefined &&
        d.value !== undefined &&
        d.value !== '' &&
        d.value > valueVarMax
      ) {
        violations.push(dp.meta.id)
      }
    })
  })
  return violations
}

export const validateLowerBoundary = (experiment: ExperimentType): number[] => {
  let violations: number[] = []
  experiment.dataPoints.forEach(dp => {
    dp.data.forEach(d => {
      const valueVarMin = experiment.valueVariables.find(
        v => v.name === d.name
      )?.min
      if (
        valueVarMin !== undefined &&
        d.value !== undefined &&
        d.value !== '' &&
        d.value < valueVarMin
      ) {
        violations.push(dp.meta.id)
      }
    })
  })
  return violations
}

export const validateDataPointsUndefined = (
  experiment: ExperimentType
): number[] => {
  const dataPoints = experiment.dataPoints
  const disabledScoreVariables = experiment.scoreVariables
    .filter(s => !s.enabled)
    .map(s => s.name)
  const violations: number[] = []
  dataPoints.forEach(dp => {
    if (
      !dp.data
        .filter(dp => !disabledScoreVariables.includes(dp.name))
        .every(dp => dp.value !== undefined && dp.value !== '')
    ) {
      violations.push(dp.meta.id)
    }
  })
  return violations
}

export const validateDuplicateDataPointIds = (
  experiment: ExperimentType
): number[] => findUniqueDuplicates(experiment.dataPoints.map(dp => dp.meta.id))

export const findUniqueDuplicates = <T extends number[] | string[]>(
  arr: T
): T =>
  arr
    // @ts-ignore - https://github.com/microsoft/TypeScript/issues/44373
    .filter((val: T, i: number, arr: T[]) => arr.indexOf(val) !== i)
    .filter((val: T, i: number, arr: T[]) => arr.indexOf(val) === i)
