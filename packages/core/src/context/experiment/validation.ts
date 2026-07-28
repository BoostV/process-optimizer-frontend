import { DataEntry, ExperimentType, ScoreFunctionType } from 'common'

export type ValidationViolations = {
  upperBoundary: number[]
  lowerBoundary: number[]
  duplicateVariableNames: string[]
  dataPointsUndefined: number[]
  duplicateDataPointIds: number[]
  categoricalValues: number[]
  dataPointsNumericType: number[]
  dataPointsResponsesUndefined: { id: number; scoreName: string }[]
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
    dataPointsNumericType: validateDataPointsNumericType(experiment),
    dataPointsResponsesUndefined:
      validateDataPointsResponsesUndefined(experiment),
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
      const valueVarMax = experiment.valueVariables
        .filter(v => v.enabled)
        .find(v => v.name === d.name)?.max
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
      const valueVarMin = experiment.valueVariables
        .filter(v => v.enabled)
        .find(v => v.name === d.name)?.min
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
    .filter(v => v.enabled)
    .map(v => v.name)
    .concat(
      experiment.categoricalVariables.filter(v => v.enabled).map(v => v.name),
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

export const validateDataPointsNumericType = (experiment: ExperimentType) => {
  const violations: number[] = []
  experiment.dataPoints.forEach(dp => {
    dp.data.forEach(d => {
      const pointVariable = experiment.valueVariables
        .filter(v => v.enabled)
        .find(v => v.name === d.name)
      if (
        pointVariable !== undefined &&
        pointVariable.type === 'discrete' &&
        d.type === 'numeric' &&
        !Number.isInteger(d.value)
      ) {
        violations.push(dp.meta.id)
      }
    })
  })
  return violations
}

export const validateDuplicateDataPointIds = (
  experiment: ExperimentType
): number[] => findUniqueDuplicates(experiment.dataPoints.map(dp => dp.meta.id))

export const findUniqueDuplicates = <T extends number | string>(
  arr: T[]
): T[] =>
  arr
    .filter((val, i: number, arr) => arr.indexOf(val) !== i)
    .filter((val, i: number, arr) => arr.indexOf(val) === i)

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

// Are all of the function's response-source symbols present & finite in `values`?
const responsesComplete = (
  scoreFunction: ScoreFunctionType,
  values: { symbol: string; value: number }[]
): boolean => {
  const provided = new Map(values.map(v => [v.symbol, v.value]))
  return scoreFunction.variables
    .filter(v => v.source === 'response')
    .every(v => {
      const val = provided.get(v.symbol)
      return val !== undefined && Number.isFinite(val)
    })
}

// How many data points would be invalid if `scoreFunction` were used for
// `scoreName` (i.e. are missing its required responses), regardless of current
// useFunction. Pass the draft function so the warning reflects what Save applies.
export const countDataPointsMissingResponses = (
  dataPoints: DataEntry[],
  scoreName: string,
  scoreFunction: ScoreFunctionType | undefined
): number => {
  if (scoreFunction === undefined) return 0
  return dataPoints.filter(dp => {
    const resp = dp.responses?.find(r => r.scoreName === scoreName)
    return !responsesComplete(scoreFunction, resp?.values ?? [])
  }).length
}

export const validateDataPointsResponsesUndefined = (
  experiment: ExperimentType
): { id: number; scoreName: string }[] => {
  const violations: { id: number; scoreName: string }[] = []
  const functionsByScore = new Map(
    experiment.scoreVariables
      .filter(sv => sv.scoreFunction !== undefined)
      .map(sv => [sv.name, sv.scoreFunction!])
  )
  experiment.dataPoints.forEach(dp => {
    dp.responses?.forEach(resp => {
      const fn = functionsByScore.get(resp.scoreName)
      if (fn === undefined || !resp.useFunction) return
      if (!responsesComplete(fn, resp.values)) {
        violations.push({ id: dp.meta.id, scoreName: resp.scoreName })
      }
    })
  })
  return violations
}

export const findUniqueEntries = (arr: number[]): number[] =>
  arr.filter((val, i, arr) => arr.indexOf(val) === i)

export type EditableTableViolation = {
  rowMetaId: number
  messages: string[]
}

export const findDataPointViolations = (
  violations: ValidationViolations | undefined
) => {
  if (violations === undefined) {
    return []
  }
  const allViolations: EditableTableViolation[] = []
  const pointsUndefined = violations.dataPointsUndefined
  const upperBoundary = violations.upperBoundary
  const lowerBoundary = violations.lowerBoundary
  const numericType = violations.dataPointsNumericType
  const responsesUndefined = violations.dataPointsResponsesUndefined
  findUniqueEntries(
    pointsUndefined
      .concat(upperBoundary)
      .concat(lowerBoundary)
      .concat(numericType)
      .concat(responsesUndefined.map(r => r.id))
  ).forEach(e => {
    const messages: string[] = []
    if (pointsUndefined.includes(e)) {
      messages.push(
        'All properties must be defined for the data point to be valid.'
      )
    }
    if (upperBoundary.includes(e)) {
      messages.push(
        'Values must be under input max values for the data point to be valid.'
      )
    }
    if (lowerBoundary.includes(e)) {
      messages.push(
        'Values must be over input min values for the data point to be valid.'
      )
    }
    if (numericType.includes(e)) {
      messages.push('Discrete values must be integers.')
    }
    responsesUndefined
      .filter(r => r.id === e)
      .forEach(r => {
        messages.push(
          `All responses must be defined to use the ${r.scoreName} function.`
        )
      })
    allViolations.push({
      rowMetaId: e,
      messages,
    })
  })
  return allViolations
}
