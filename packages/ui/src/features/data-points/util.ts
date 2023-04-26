import { ValidationViolations } from '@boostv/process-optimizer-frontend-core'
import { EditableTableViolation } from '../core/editable-table'

export const findUniqueEntries = (arr: number[]): number[] =>
  arr.filter((val, i, arr) => arr.indexOf(val) === i)

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
  findUniqueEntries(
    pointsUndefined.concat(upperBoundary).concat(lowerBoundary)
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
    allViolations.push({
      rowMetaId: e,
      messages,
    })
  })
  return allViolations
}
