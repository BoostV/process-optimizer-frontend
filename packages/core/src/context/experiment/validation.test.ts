import { describe, expect, it } from 'vitest'
import { emptyExperiment } from './store'
import {
  ValidationViolations,
  findDataPointViolations,
  validateCategoricalValues,
  validateDataPointsNumericType,
  validateDataPointsUndefined,
  validateDuplicateDataPointIds,
  validateDuplicateVariableNames,
  validateExperiment,
  validateLowerBoundary,
  validateUpperBoundary,
} from './validation'
import { ExperimentType, ScoreFunctionType, scoreNames } from '@core/common'
import { countDataPointsMissingResponses } from './validation'
import { validationReducer } from './validation-reducer'

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
          name: 'quality',
          label: 'qualitylabel',
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
            { type: 'score', name: 'quality', value: 1 },
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
          name: 'quality',
          label: 'qualitylabel',
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
          name: 'quality',
          label: 'qualitylabel',
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
              name: 'quality',
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
          name: 'quality',
          label: 'qualitylabel',
          description: '',
          enabled: true,
        },
        {
          name: 'cost',
          label: 'costlabel',
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
              name: scoreNames[0],
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
    dataPointsResponsesUndefined: [],
    dataPointsScoreUncomputable: [],
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

const buildExperimentWithQualityFunction = (
  fn: ScoreFunctionType
): ExperimentType => ({
  ...emptyExperiment,
  scoreVariables: emptyExperiment.scoreVariables.map(sv =>
    sv.name === scoreNames[0] ? { ...sv, scoreFunction: fn } : sv
  ),
  dataPoints: [
    {
      meta: {
        id: 1,
        enabled: true,
        valid: true,
      },
      data: [],
      responses: [
        {
          scoreName: scoreNames[0],
          useFunction: true,
          values: [],
        },
      ],
    },
  ],
})

describe('response validation', () => {
  const base = () =>
    buildExperimentWithQualityFunction({
      expression: 'weight * 2',
      variables: [{ name: 'Weight', symbol: 'weight', source: 'response' }],
    })

  it('flags a row using the function with a missing response value', () => {
    const exp = base() // dataPoint meta.id 1, responses useFunction:true but values:[]
    const v = validateExperiment(exp)
    expect(
      v.dataPointsResponsesUndefined.some(
        x => x.id === 1 && x.scoreName === 'quality'
      )
    ).toBe(true)
    const messages =
      findDataPointViolations(v).find(x => x.rowMetaId === 1)?.messages ?? []
    expect(messages).toContain(
      'All responses must be defined to use the quality function.'
    )
  })

  it('does not flag a row in manual mode', () => {
    const exp = base()
    exp.dataPoints[0]!.responses = [
      { scoreName: 'quality', useFunction: false, values: [] },
    ]
    expect(
      validateExperiment(exp).dataPointsResponsesUndefined.some(x => x.id === 1)
    ).toBe(false)
  })
})

describe('countDataPointsMissingResponses', () => {
  const fn = {
    expression: 'w * 2',
    variables: [{ name: 'W', symbol: 'w', source: 'response' as const }],
  }
  const complete = {
    meta: { id: 1, enabled: true, valid: true },
    data: [{ type: 'score' as const, name: 'quality', value: 0 }],
    responses: [
      {
        scoreName: 'quality' as const,
        useFunction: false,
        values: [{ symbol: 'w', value: 2 }],
      },
    ],
  }
  const missing = {
    meta: { id: 2, enabled: true, valid: true },
    data: [{ type: 'score' as const, name: 'quality', value: 0 }],
  }

  it('counts data points lacking the function’s required responses (ignoring current useFunction)', () => {
    expect(
      countDataPointsMissingResponses([complete, missing], 'quality', fn)
    ).toBe(1)
  })

  it('returns 0 when there is no score function', () => {
    expect(
      countDataPointsMissingResponses([missing], 'quality', undefined)
    ).toBe(0)
  })
})

it('flags a function-mode point as invalid when a used factor is unavailable', () => {
  const experiment = {
    ...emptyExperiment,
    valueVariables: [
      // "Pin elevation" is disabled -> not present in the data point's data
      {
        type: 'discrete' as const,
        name: 'Pin elevation',
        description: '',
        min: 0,
        max: 200,
        enabled: false,
      },
    ],
    scoreVariables: [
      {
        name: 'quality' as const,
        label: 'Quality (0-5)',
        description: '',
        enabled: true,
        scoreFunction: {
          expression: 'pinElevation',
          variables: [
            {
              name: 'Pin elevation',
              symbol: 'pinElevation',
              source: 'factor' as const,
              factorName: 'Pin elevation',
            },
          ],
        },
      },
    ],
    dataPoints: [
      {
        meta: { id: 1, enabled: true, valid: true },
        data: [{ type: 'score' as const, name: 'quality', value: 3 }], // no Pin elevation column
        responses: [
          { scoreName: 'quality' as const, useFunction: true, values: [] },
        ],
      },
    ],
  }
  const violations = validateExperiment(experiment)
  expect(violations.dataPointsScoreUncomputable).toContainEqual({
    id: 1,
    scoreName: 'quality',
  })
  const validated = validationReducer(experiment, violations)
  expect(validated.dataPoints[0]?.meta.valid).toBe(false)
})
