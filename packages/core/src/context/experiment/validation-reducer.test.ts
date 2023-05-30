import { ExperimentType } from 'common'
import { emptyExperiment } from './store'
import { validationReducer } from './validation-reducer'
import { ValidationViolations } from './validation'

const exp: ExperimentType = {
  ...emptyExperiment,
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
          value: 100,
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
          type: 'numeric',
          name: 'Water',
          value: 100,
        },
      ],
    },
  ],
}

const emptyViolations = {
  dataPointsUndefined: [],
  duplicateVariableNames: [],
  lowerBoundary: [],
  upperBoundary: [],
  duplicateDataPointIds: [],
  categoricalValues: [],
  dataPointsNumericType: [],
} satisfies ValidationViolations

describe('validationReducer', () => {
  it('should not invalidate data points with no violations', () => {
    const validatedExperiment = validationReducer(exp, emptyViolations)
    expect(validatedExperiment.dataPoints[0]?.meta.valid).toBeTruthy()
    expect(validatedExperiment.dataPoints[1]?.meta.valid).toBeTruthy()
  })

  it('should invalidate data points with undefined properties', () => {
    const validatedExperiment = validationReducer(exp, {
      ...emptyViolations,
      dataPointsUndefined: [1],
    })
    expect(validatedExperiment.dataPoints[0]?.meta.valid).toBeFalsy()
    expect(validatedExperiment.dataPoints[1]?.meta.valid).toBeTruthy()
  })

  it('should invalidate data points with lower boundary violations', () => {
    const validatedExperiment = validationReducer(exp, {
      ...emptyViolations,
      lowerBoundary: [1],
    })
    expect(validatedExperiment.dataPoints[0]?.meta.valid).toBeFalsy()
    expect(validatedExperiment.dataPoints[1]?.meta.valid).toBeTruthy()
  })

  it('should invalidate data points with upper boundary violations', () => {
    const validatedExperiment = validationReducer(exp, {
      ...emptyViolations,
      upperBoundary: [1],
    })
    expect(validatedExperiment.dataPoints[0]?.meta.valid).toBeFalsy()
    expect(validatedExperiment.dataPoints[1]?.meta.valid).toBeTruthy()
  })

  it('should invalidate data points with duplicate ids', () => {
    const validatedExperiment = validationReducer(
      {
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
                type: 'numeric',
                name: 'Water',
                value: 100,
              },
            ],
          },
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
                value: 100,
              },
            ],
          },
        ],
      },
      {
        ...emptyViolations,
        duplicateDataPointIds: [1],
      }
    )
    expect(validatedExperiment.dataPoints[0]?.meta.valid).toBeFalsy()
    expect(validatedExperiment.dataPoints[1]?.meta.valid).toBeFalsy()
  })

  it('should invalidate all data points when there are duplicate variable names', () => {
    const validatedExperiment = validationReducer(exp, {
      ...emptyViolations,
      duplicateDataPointIds: [1, 2],
    })
    expect(validatedExperiment.dataPoints[0]?.meta.valid).toBeFalsy()
    expect(validatedExperiment.dataPoints[1]?.meta.valid).toBeFalsy()
  })

  it('should invalidate data points with no corresponding categorical option', () => {
    const validatedExperiment = validationReducer(exp, {
      ...emptyViolations,
      categoricalValues: [1],
    })
    expect(validatedExperiment.dataPoints[0]?.meta.valid).toBeFalsy()
    expect(validatedExperiment.dataPoints[1]?.meta.valid).toBeTruthy()
  })

  it('should invalidate discrete data points with continuous values', () => {
    const validatedExperiment = validationReducer(exp, {
      ...emptyViolations,
      dataPointsNumericType: [1],
    })
    expect(validatedExperiment.dataPoints[0]?.meta.valid).toBeFalsy()
    expect(validatedExperiment.dataPoints[1]?.meta.valid).toBeTruthy()
  })
})
