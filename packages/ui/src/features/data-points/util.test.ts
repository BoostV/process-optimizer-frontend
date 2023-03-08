import { findDataPointViolations } from './util'
import { ValidationViolations } from '@boostv/process-optimizer-frontend-core'

describe('findDataPointViolations', () => {
  const violations: ValidationViolations = {
    dataPointsUndefined: [1, 2],
    duplicateDataPointIds: [],
    duplicateVariableNames: [],
    lowerBoundary: [1, 4],
    upperBoundary: [1, 2, 5, 6],
    dataPointsNotNumber: [2],
  }
  it('should return correct list of data point violations', () => {
    const dpViolations = findDataPointViolations(violations)
    const expected = [
      {
        rowMetaId: 1,
        messages: [
          'All properties must be defined to enable the data point.',
          'Values must be under input max values to enable the data point.',
          'Values must be over input min values to enable the data point.',
        ],
      },
      {
        rowMetaId: 2,
        messages: [
          'All properties must be defined to enable the data point.',
          'Values must be under input max values to enable the data point.',
          'Value variables must be numeric to enable the data point.',
        ],
      },
      {
        rowMetaId: 4,
        messages: [
          'Values must be over input min values to enable the data point.',
        ],
      },
      {
        rowMetaId: 5,
        messages: [
          'Values must be under input max values to enable the data point.',
        ],
      },
      {
        rowMetaId: 6,
        messages: [
          'Values must be under input max values to enable the data point.',
        ],
      },
    ]
    expect(dpViolations.sort((a, b) => a.rowMetaId - b.rowMetaId)).toEqual(
      expected
    )
  })
})
