import { ExperimentType } from 'common'

export type ValidationViolations = {
  upperBoundary: number[]
  lowerBoundary: number[]
  duplicateVariableNames: string[]
  dataPointsUndefined: number[]
  duplicateDataPointIds: number[]
  categoricalValues: number[]
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
    categoricalValues: validateCategoricalValues(experiment),
  }
}

// Needed to ensure that e.g. boundary validation works
export const validateDuplicateVariableNames = (
  experiment: ExperimentType
): string[] =>
  findUniqueDuplicates(
    experiment.valueVariables
      .map(v => v.name)
      .concat(experiment.categoricalVariables.map(c => c.name))
  )

export const validateUpperBoundary = (experiment: ExperimentType): number[] => {
  const violations: number[] = []
  experiment.dataPoints.forEach(dp => {
    dp.data.forEach(d => {
      const valueVarMax = experiment.valueVariables.find(
        v => v.name === d.name
      )?.max
      if (
        valueVarMax !== undefined &&
        d.value !== undefined &&
        d.value !== '' &&
        Number(d.value) > valueVarMax
      ) {
        violations.push(dp.meta.id)
      }
    })
  })
  return violations
}

export const validateLowerBoundary = (experiment: ExperimentType): number[] => {
  const violations: number[] = []
  experiment.dataPoints.forEach(dp => {
    dp.data.forEach(d => {
      const valueVarMin = experiment.valueVariables.find(
        v => v.name === d.name
      )?.min
      if (
        valueVarMin !== undefined &&
        d.value !== undefined &&
        d.value !== '' &&
        Number(d.value) < valueVarMin
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
  const enabledVariables = experiment.valueVariables
    .filter(() => true)
    .map(v => v.name)
    .concat(
      experiment.categoricalVariables.filter(() => true).map(v => v.name),
      experiment.scoreVariables.filter(v => v.enabled).map(v => v.name)
    )
  const violations: number[] = []
  dataPoints.forEach(dp => {
    const names = dp.data.map(d => d.name)
    if (!enabledVariables.every(v => names.includes(v))) {
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - https://github.com/microsoft/TypeScript/issues/44373
    .filter((val: T, i: number, arr: T[]) => arr.indexOf(val) !== i)
    .filter((val: T, i: number, arr: T[]) => arr.indexOf(val) === i)

export const validateCategoricalValues = (experiment: ExperimentType) => {
  const dataPoints = experiment.dataPoints
  const categoricalVars = experiment.categoricalVariables
  const violations: number[] = []
  dataPoints.forEach(dp => {
    dp.data.forEach(d => {
      const catVar = categoricalVars.find(c => c.name === d.name)
      if (catVar !== undefined && !catVar.options.includes('' + d.value)) {
        violations.push(dp.meta.id)
      }
    })
  })
  return violations
}
