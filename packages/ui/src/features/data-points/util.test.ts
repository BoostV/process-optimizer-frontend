import { findDataPointViolations } from './util'
import { ValidationViolations } from '@boostv/process-optimizer-frontend-core'

describe('findDataPointViolations', () => {
  const violations: ValidationViolations = {
    dataPointsUndefined: [1, 2],
    duplicateDataPointIds: [],
    duplicateVariableNames: [],
    lowerBoundary: [1, 4],
    upperBoundary: [1, 2, 5, 6],
  }
  it('should return correct list of data point violations', () => {
    const dpViolations = findDataPointViolations(violations)
    const expected = [
      {
        rowMetaId: 1,
        messages: [
          'All properties must be defined for the data point to be valid.',
          'Values must be under input max values for the data point to be valid.',
          'Values must be over input min values for the data point to be valid.',
        ],
      },
      {
        rowMetaId: 2,
        messages: [
          'All properties must be defined for the data point to be valid.',
          'Values must be under input max values for the data point to be valid.',
        ],
      },
      {
        rowMetaId: 4,
        messages: [
          'Values must be over input min values for the data point to be valid.',
        ],
      },
      {
        rowMetaId: 5,
        messages: [
          'Values must be under input max values for the data point to be valid.',
        ],
      },
      {
        rowMetaId: 6,
        messages: [
          'Values must be under input max values for the data point to be valid.',
        ],
      },
    ]
    expect(dpViolations.sort((a, b) => a.rowMetaId - b.rowMetaId)).toEqual(
      expected
    )
  })
})
