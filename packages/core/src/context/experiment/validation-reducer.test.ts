import { ExperimentType } from '@core/common'
import { emptyExperiment } from './store'
import { validationReducer } from './validation-reducer'

const exp: ExperimentType = {
  ...emptyExperiment,
  dataPoints: [
    {
      meta: {
        id: 1,
        enabled: true,
      },
      data: [
        {
          name: 'Water',
          value: 100,
        },
      ],
    },
    {
      meta: {
        id: 2,
        enabled: true,
      },
      data: [
        {
          name: 'Water',
          value: 100,
        },
      ],
    },
  ],
}

describe('validationReducer', () => {
  it('should not disable data points with no violations', () => {
    const validatedExperiment = validationReducer(exp, {
      dataPointsUndefined: [],
      duplicateVariableNames: [],
      lowerBoundary: [],
      upperBoundary: [],
      duplicateDataPointIds: [],
    })
    expect(validatedExperiment.dataPoints[0]?.meta.enabled).toBeTruthy()
    expect(validatedExperiment.dataPoints[1]?.meta.enabled).toBeTruthy()
  })

  it('should disable data points with undefined properties', () => {
    const validatedExperiment = validationReducer(exp, {
      dataPointsUndefined: [1],
      duplicateVariableNames: [],
      lowerBoundary: [],
      upperBoundary: [],
      duplicateDataPointIds: [],
    })
    expect(validatedExperiment.dataPoints[0]?.meta.enabled).toBeFalsy()
    expect(validatedExperiment.dataPoints[1]?.meta.enabled).toBeTruthy()
  })

  it('should disable data points with lower boundary violations', () => {
    const validatedExperiment = validationReducer(exp, {
      dataPointsUndefined: [],
      duplicateVariableNames: [],
      lowerBoundary: [1],
      upperBoundary: [],
      duplicateDataPointIds: [],
    })
    expect(validatedExperiment.dataPoints[0]?.meta.enabled).toBeFalsy()
    expect(validatedExperiment.dataPoints[1]?.meta.enabled).toBeTruthy()
  })

  it('should disable data points with upper boundary violations', () => {
    const validatedExperiment = validationReducer(exp, {
      dataPointsUndefined: [],
      duplicateVariableNames: [],
      lowerBoundary: [],
      upperBoundary: [1],
      duplicateDataPointIds: [],
    })
    expect(validatedExperiment.dataPoints[0]?.meta.enabled).toBeFalsy()
    expect(validatedExperiment.dataPoints[1]?.meta.enabled).toBeTruthy()
  })

  it('should disable data points with duplicate ids', () => {
    const validatedExperiment = validationReducer(
      {
        ...exp,
        dataPoints: [
          {
            meta: {
              id: 1,
              enabled: true,
            },
            data: [
              {
                name: 'Water',
                value: 100,
              },
            ],
          },
          {
            meta: {
              id: 1,
              enabled: true,
            },
            data: [
              {
                name: 'Water',
                value: 100,
              },
            ],
          },
        ],
      },
      {
        dataPointsUndefined: [],
        duplicateVariableNames: [],
        lowerBoundary: [],
        upperBoundary: [],
        duplicateDataPointIds: [1],
      }
    )
    expect(validatedExperiment.dataPoints[0]?.meta.enabled).toBeFalsy()
    expect(validatedExperiment.dataPoints[1]?.meta.enabled).toBeFalsy()
  })

  it('should disable all data points when there are duplicate variable names', () => {
    const validatedExperiment = validationReducer(exp, {
      dataPointsUndefined: [],
      duplicateVariableNames: [],
      lowerBoundary: [],
      upperBoundary: [],
      duplicateDataPointIds: [1, 2],
    })
    expect(validatedExperiment.dataPoints[0]?.meta.enabled).toBeFalsy()
    expect(validatedExperiment.dataPoints[1]?.meta.enabled).toBeFalsy()
  })
})
