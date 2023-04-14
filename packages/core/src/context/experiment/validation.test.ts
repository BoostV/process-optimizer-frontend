import { ExperimentType, ValueVariableType } from 'common'
import { emptyExperiment } from './store'
import {
  validateDataPointsNotNumber,
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
            data: [
              {
                name: 'Water',
                value: 100,
              },
            ],
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
              name: 'Water',
              value: 101,
            },
          ],
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
              name: 'Water',
              value: 101,
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
              name: 'Water',
              value: 102,
            },
          ],
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
              name: 'Water',
              value: 50,
            },
          ],
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
            data: [
              {
                name: 'Water',
                value: 10,
              },
            ],
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
              name: 'Water',
              value: 9,
            },
          ],
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
              name: 'Water',
              value: 8,
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
              name: 'Water',
              value: 9,
            },
          ],
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
        },
        {
          name: 'Cheese',
          min: 10,
          max: 100,
          type: 'continuous',
          description: '',
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
        },
        {
          name: 'Water',
          min: 10,
          max: 100,
          type: 'continuous',
          description: '',
        },
        {
          name: 'Water',
          min: 10,
          max: 100,
          type: 'continuous',
          description: '',
        },
        {
          name: 'Cheese',
          min: 10,
          max: 100,
          type: 'continuous',
          description: '',
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
        },
      ],
      categoricalVariables: [
        {
          name: 'Water',
          options: [],
          description: '',
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
            {
              name: 'Water',
              value: 10,
            },
            {
              name: 'score',
              value: 1,
            },
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
          data: [
            {
              name: 'Water',
              value: 10,
            },
            {
              name: 'score',
              value: undefined,
            },
          ],
        },
      ],
    }
    expect(validateDataPointsUndefined(exp)).toEqual([1])
  })

  it('should return two data point with undefined properties', () => {
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
            {
              name: 'Water',
              value: 10,
            },
            {
              name: 'score',
              value: undefined,
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
              name: 'Water',
              value: undefined,
            },
            {
              name: 'score',
              value: 1,
            },
          ],
        },
      ],
    }
    expect(validateDataPointsUndefined(exp)).toEqual([1, 2])
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
              name: 'Water',
              value: 10,
            },
            {
              name: 'score',
              value: 1,
            },
            {
              name: 'score 2',
              value: undefined,
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

describe('validateDataPointsNotNumber', () => {
  const valueVariables: ValueVariableType[] = [
    {
      name: 'Water',
      min: 10,
      max: 100,
      type: 'discrete',
      description: '',
    },
  ]

  it('should return violation when value variable is not a number - string', () => {
    expect(
      validateDataPointsNotNumber({
        ...emptyExperiment,
        valueVariables,
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
                value: 'notANumber',
              },
            ],
          },
        ],
      })
    ).toEqual([1])
  })

  it('should return violation when value variable is not a number - empty array', () => {
    expect(
      validateDataPointsNotNumber({
        ...emptyExperiment,
        valueVariables,
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
                value: [],
              },
            ],
          },
        ],
      })
    ).toEqual([1])
  })

  it('should return violation when value variable is a number array', () => {
    expect(
      validateDataPointsNotNumber({
        ...emptyExperiment,
        valueVariables,
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
                value: [1],
              },
            ],
          },
        ],
      })
    ).toEqual([1])
  })

  it('should return violation when score is not a number', () => {
    expect(
      validateDataPointsNotNumber({
        ...emptyExperiment,
        valueVariables,
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
              enabled: true,
              valid: true,
              id: 1,
            },
            data: [
              {
                name: 'score',
                value: 'notANumber',
              },
            ],
          },
        ],
      })
    ).toEqual([1])
  })

  it('should return empty array when value variable is a number - number', () => {
    expect(
      validateDataPointsNotNumber({
        ...emptyExperiment,
        valueVariables,
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
                value: 1,
              },
            ],
          },
        ],
      })
    ).toEqual([])
  })

  it('should return empty array when value variable is a number - string', () => {
    expect(
      validateDataPointsNotNumber({
        ...emptyExperiment,
        valueVariables,
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
                value: '1',
              },
            ],
          },
        ],
      })
    ).toEqual([])
  })
})
