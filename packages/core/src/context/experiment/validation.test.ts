import { ExperimentType } from 'common'
import { emptyExperiment } from './store'
import {
  ValidationViolations,
  findDataPointViolations,
  validateCategoricalValues,
  validateDataPointsNumericType,
  validateDataPointsUndefined,
  validateDuplicateDataPointIds,
  validateDuplicateVariableNames,
  validateLowerBoundary,
  validateUpperBoundary,
} from './validation'

describe('validateUpperBoundary', () => {
  it('should return empty array if no violations exist', () => {
    const exp: ExperimentType = {
      ...emptyExperiment,
      valueVariables: [
        {
          name: 'Water',
          min: 10,
          max: 100,
          type: 'discrete',
          description: '',
          enabled: true,
        },
      ],
      dataPoints: [
        {
          meta: {
            id: 1,
            enabled: true,
            valid: true,
          },
          data: [
            {
              type: 'numeric',
              name: 'Water',
              value: 50,
            },
          ],
        },
      ],
    }
    expect(validateUpperBoundary(exp)).toEqual([])
    expect(
      validateUpperBoundary({
        ...exp,
        dataPoints: [
          {
            meta: {
              id: 1,
              enabled: true,
              valid: true,
            },
            data: [{ type: 'numeric', name: 'Water', value: 100 }],
          },
        ],
      })
    ).toEqual([])
  })

  it('should return one violation', () => {
    const exp: ExperimentType = {
      ...emptyExperiment,
      valueVariables: [
        {
          name: 'Water',
          min: 10,
          max: 100,
          type: 'discrete',
          description: '',
          enabled: true,
        },
      ],
      dataPoints: [
        {
          meta: {
            id: 1,
            enabled: true,
            valid: true,
          },
          data: [{ type: 'numeric', name: 'Water', value: 101 }],
        },
      ],
    }
    expect(validateUpperBoundary(exp)).toEqual([1])
  })

  it('should return multiple violations', () => {
    const exp: ExperimentType = {
      ...emptyExperiment,
      valueVariables: [
        {
          name: 'Water',
          min: 10,
          max: 100,
          type: 'discrete',
          description: '',
          enabled: true,
        },
      ],
      dataPoints: [
        {
          meta: {
            id: 1,
            enabled: true,
            valid: true,
          },
          data: [{ type: 'numeric', name: 'Water', value: 101 }],
        },
        {
          meta: {
            id: 2,
            enabled: true,
            valid: true,
          },
          data: [{ type: 'numeric', name: 'Water', value: 102 }],
        },
      ],
    }
    expect(validateUpperBoundary(exp)).toEqual([1, 2])
  })
})

describe('validateLowerBoundary', () => {
  it('should return empty array if no violations exist', () => {
    const exp: ExperimentType = {
      ...emptyExperiment,
      valueVariables: [
        {
          name: 'Water',
          min: 10,
          max: 100,
          type: 'discrete',
          description: '',
          enabled: true,
        },
      ],
      dataPoints: [
        {
          meta: {
            id: 1,
            enabled: true,
            valid: true,
          },
          data: [{ type: 'numeric', name: 'Water', value: 50 }],
        },
      ],
    }
    expect(validateLowerBoundary(exp)).toEqual([])
    expect(
      validateLowerBoundary({
        ...exp,
        dataPoints: [
          {
            meta: {
              id: 1,
              enabled: true,
              valid: true,
            },
            data: [{ type: 'numeric', name: 'Water', value: 10 }],
          },
        ],
      })
    ).toEqual([])
  })

  it('should return one violation', () => {
    const exp: ExperimentType = {
      ...emptyExperiment,
      valueVariables: [
        {
          name: 'Water',
          min: 10,
          max: 100,
          type: 'discrete',
          description: '',
          enabled: true,
        },
      ],
      dataPoints: [
        {
          meta: {
            id: 1,
            enabled: true,
            valid: true,
          },
          data: [{ type: 'numeric', name: 'Water', value: 9 }],
        },
      ],
    }
    expect(validateLowerBoundary(exp)).toEqual([1])
  })

  it('should return multiple violations', () => {
    const exp: ExperimentType = {
      ...emptyExperiment,
      valueVariables: [
        {
          name: 'Water',
          min: 10,
          max: 100,
          type: 'discrete',
          description: '',
          enabled: true,
        },
      ],
      dataPoints: [
        {
          meta: {
            id: 1,
            enabled: true,
            valid: true,
          },
          data: [{ type: 'numeric', name: 'Water', value: 8 }],
        },
        {
          meta: {
            id: 2,
            enabled: true,
            valid: true,
          },
          data: [{ type: 'numeric', name: 'Water', value: 9 }],
        },
      ],
    }
    expect(validateLowerBoundary(exp)).toEqual([1, 2])
  })
})

describe('validateDuplicateVariableNames', () => {
  it('should return empty array when no duplicates exist', () => {
    const exp: ExperimentType = {
      ...emptyExperiment,
      valueVariables: [
        {
          name: 'Water',
          min: 10,
          max: 100,
          type: 'continuous',
          description: '',
          enabled: true,
        },
        {
          name: 'Cheese',
          min: 10,
          max: 100,
          type: 'continuous',
          description: '',
          enabled: true,
        },
      ],
    }
    expect(validateDuplicateVariableNames(exp)).toEqual([])
  })

  it('should return unique duplicates when duplicate value variables exist', () => {
    const exp: ExperimentType = {
      ...emptyExperiment,
      valueVariables: [
        {
          name: 'Water',
          min: 10,
          max: 100,
          type: 'continuous',
          description: '',
          enabled: true,
        },
        {
          name: 'Water',
          min: 10,
          max: 100,
          type: 'continuous',
          description: '',
          enabled: true,
        },
        {
          name: 'Water',
          min: 10,
          max: 100,
          type: 'continuous',
          description: '',
          enabled: true,
        },
        {
          name: 'Cheese',
          min: 10,
          max: 100,
          type: 'continuous',
          description: '',
          enabled: true,
        },
      ],
    }
    expect(validateDuplicateVariableNames(exp)).toEqual(['Water'])
  })

  it('should return unique duplicates when duplicate categorical and value variables exist', () => {
    const exp: ExperimentType = {
      ...emptyExperiment,
      valueVariables: [
        {
          name: 'Water',
          min: 10,
          max: 100,
          type: 'continuous',
          description: '',
          enabled: true,
        },
      ],
      categoricalVariables: [
        {
          name: 'Water',
          options: [],
          description: '',
          enabled: true,
        },
      ],
    }
    expect(validateDuplicateVariableNames(exp)).toEqual(['Water'])
  })
})

describe('validateDataPointsUndefined', () => {
  it('should return empty array when no data points have undefined properties', () => {
    const exp: ExperimentType = {
      ...emptyExperiment,
      scoreVariables: [
        {
          name: 'score',
          description: '',
          enabled: true,
        },
      ],
      dataPoints: [
        {
          meta: {
            id: 1,
            enabled: true,
            valid: true,
          },
          data: [
            { type: 'numeric', name: 'Water', value: 10 },
            { type: 'score', name: 'score', value: 1 },
          ],
        },
      ],
    }
    expect(validateDataPointsUndefined(exp)).toEqual([])
  })

  it('should return one data point with undefined properties', () => {
    const exp: ExperimentType = {
      ...emptyExperiment,
      scoreVariables: [
        {
          name: 'score',
          description: '',
          enabled: true,
        },
      ],
      dataPoints: [
        {
          meta: {
            id: 1,
            enabled: true,
            valid: true,
          },
          data: [{ type: 'numeric', name: 'Water', value: 10 }],
        },
      ],
    }
    expect(validateDataPointsUndefined(exp)).toEqual([1])
  })

  it('should return two data points with undefined properties', () => {
    const exp: ExperimentType = {
      ...emptyExperiment,
      valueVariables: [
        {
          name: 'Water',
          type: 'discrete',
          description: '',
          min: 0,
          max: 100,
          enabled: true,
        },
      ],
      scoreVariables: [
        {
          name: 'score',
          description: '',
          enabled: true,
        },
      ],
      dataPoints: [
        {
          meta: {
            id: 1,
            enabled: true,
            valid: true,
          },
          data: [
            {
              type: 'numeric',
              name: 'Water',
              value: 10,
            },
          ],
        },
        {
          meta: {
            id: 2,
            enabled: true,
            valid: true,
          },
          data: [
            {
              type: 'score',
              name: 'score',
              value: 1,
            },
          ],
        },
      ],
    }
    expect(validateDataPointsUndefined(exp)).toEqual([1, 2])
  })

  it('should return data point with undefined value', () => {
    const exp: ExperimentType = {
      ...emptyExperiment,
      valueVariables: [
        {
          name: 'Water',
          type: 'discrete',
          description: '',
          min: 0,
          max: 100,
          enabled: true,
        },
      ],
      dataPoints: [
        {
          meta: {
            id: 1,
            enabled: true,
            valid: true,
          },
          data: [
            {
              type: 'numeric',
              name: 'Water',
              value: undefined,
            },
          ],
        },
      ],
    }
    expect(validateDataPointsUndefined(exp)).toEqual([1])
  })

  it('should return empty array if score is undefined but also disabled', () => {
    const exp: ExperimentType = {
      ...emptyExperiment,
      scoreVariables: [
        {
          name: 'score',
          description: '',
          enabled: true,
        },
        {
          name: 'score 2',
          description: '',
          enabled: false,
        },
      ],
      dataPoints: [
        {
          meta: {
            id: 1,
            enabled: true,
            valid: true,
          },
          data: [
            {
              type: 'numeric',
              name: 'Water',
              value: 10,
            },
            {
              type: 'score',
              name: 'score',
              value: 1,
            },
          ],
        },
      ],
    }
    expect(validateDataPointsUndefined(exp)).toEqual([])
  })
})

describe('validateDuplicateDataPointIds', () => {
  it('should return unique duplicates', () => {
    const exp: ExperimentType = {
      ...emptyExperiment,
      dataPoints: [
        {
          meta: {
            enabled: true,
            valid: true,
            id: 1,
          },
          data: [],
        },
        {
          meta: {
            enabled: true,
            valid: true,
            id: 1,
          },
          data: [],
        },
        {
          meta: {
            enabled: true,
            valid: true,
            id: 1,
          },
          data: [],
        },
        {
          meta: {
            enabled: true,
            valid: true,
            id: 2,
          },
          data: [],
        },
        {
          meta: {
            enabled: true,
            valid: true,
            id: 2,
          },
          data: [],
        },
        {
          meta: {
            enabled: true,
            valid: true,
            id: 3,
          },
          data: [],
        },
      ],
    }
    expect(validateDuplicateDataPointIds(exp)).toEqual([1, 2])
  })

  it('should return empty array when no duplicates exist', () => {
    const exp: ExperimentType = {
      ...emptyExperiment,
      dataPoints: [
        {
          meta: {
            enabled: true,
            valid: true,
            id: 1,
          },
          data: [],
        },
        {
          meta: {
            enabled: true,
            valid: true,
            id: 2,
          },
          data: [],
        },
      ],
    }
    expect(validateDuplicateDataPointIds(exp)).toEqual([])
  })
})

describe('validateCategoricalValues', () => {
  it('should return data points with no corresponding categorical options', () => {
    const exp: ExperimentType = {
      ...emptyExperiment,
      categoricalVariables: [
        {
          name: 'Berry',
          description: '',
          options: ['Blue', 'Green'],
          enabled: true,
        },
      ],
      dataPoints: [
        {
          meta: {
            enabled: true,
            valid: true,
            id: 1,
          },
          data: [
            {
              name: 'Berry',
              type: 'categorical',
              value: 'Red',
            },
          ],
        },
      ],
    }
    expect(validateCategoricalValues(exp)).toEqual([1])
  })
})

describe('validateDataPointsNumericType', () => {
  it('should return discrete data points with continuous values', () => {
    const exp: ExperimentType = {
      ...emptyExperiment,
      valueVariables: [
        {
          name: 'Water',
          min: 100,
          max: 200,
          description: '',
          enabled: true,
          type: 'discrete',
        },
      ],
      dataPoints: [
        {
          meta: {
            enabled: true,
            valid: true,
            id: 1,
          },
          data: [
            {
              name: 'Water',
              type: 'numeric',
              value: 128.49,
            },
          ],
        },
      ],
    }
    expect(validateDataPointsNumericType(exp)).toEqual([1])
  })
  it('should not return continuous data points with continuous values', () => {
    const exp: ExperimentType = {
      ...emptyExperiment,
      valueVariables: [
        {
          name: 'Water',
          min: 100,
          max: 200,
          description: '',
          enabled: true,
          type: 'continuous',
        },
      ],
      dataPoints: [
        {
          meta: {
            enabled: true,
            valid: true,
            id: 1,
          },
          data: [
            {
              name: 'Water',
              type: 'numeric',
              value: 128.49,
            },
          ],
        },
      ],
    }
    expect(validateDataPointsNumericType(exp)).toEqual([])
  })
})

describe('findDataPointViolations', () => {
  const violations: ValidationViolations = {
    dataPointsUndefined: [1, 2],
    duplicateDataPointIds: [],
    duplicateVariableNames: [],
    lowerBoundary: [1, 4],
    upperBoundary: [1, 2, 5, 6],
    categoricalValues: [],
    dataPointsNumericType: [3],
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
        rowMetaId: 3,
        messages: ['Discrete values must be integers.'],
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
