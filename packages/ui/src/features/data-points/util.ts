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
    pointsUndefined.concat(upperBoundary, lowerBoundary)
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
    allViolations.push({
      rowMetaId: e,
      messages,
    })
  })
  return allViolations
}
