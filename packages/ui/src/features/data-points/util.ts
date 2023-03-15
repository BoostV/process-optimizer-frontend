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
  const notNumbers = violations.dataPointsNotNumber
  findUniqueEntries(
    pointsUndefined
      .concat(upperBoundary)
      .concat(lowerBoundary)
      .concat(notNumbers)
  ).forEach(e => {
    const messages: string[] = []
    if (pointsUndefined.includes(e)) {
      messages.push('All properties must be defined to enable the data point.')
    }
    if (upperBoundary.includes(e)) {
      messages.push(
        'Values must be under input max values to enable the data point.'
      )
    }
    if (lowerBoundary.includes(e)) {
      messages.push(
        'Values must be over input min values to enable the data point.'
      )
    }
    if (notNumbers.includes(e)) {
      messages.push('Value variables must be numeric to enable the data point.')
    }
    allViolations.push({
      rowMetaId: e,
      messages,
    })
  })
  return allViolations
}