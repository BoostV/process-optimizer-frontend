import { describe, expect, it } from 'vitest'
import { emptyExperiment } from '@core/context'
import {
  ExperimentType,
  isExperiment,
  experimentSchema,
  currentVersion,
} from './common'

describe('Type guards', () => {
  it('should not narrow blank object', () => {
    const blank = {}
    const result = isExperiment(blank)
    expect(result).toBeFalsy()
  })

  it('should not narrow object with wrong version in info', () => {
    const minimal = {
      info: {
        dataFormatVersion: '6',
      },
    }
    const result = isExperiment(minimal)
    expect(result).toBeFalsy()
  })

  it('should narrow default empty experiment', () => {
    const defaultExperiment = emptyExperiment
    const result = isExperiment(defaultExperiment)
    expect(result).toBeTruthy()
  })

  it('should narrow type', () => {
    // This test should result in compilation error if narrowing fails
    const defaultExperiment = emptyExperiment
    if (isExperiment(defaultExperiment)) {
      const experiement: ExperimentType = defaultExperiment
      expect(experiement.info.dataFormatVersion !== undefined)
    }
  })
})

describe('score function schema (v21)', () => {
  it('currentVersion is 21', () => {
    expect(currentVersion).toBe('21')
  })

  it('accepts a scoreVariable with a scoreFunction and a dataEntry with responses', () => {
    const experiment = {
      id: 'x',
      changedSinceLastEvaluation: false,
      info: {
        name: 'n',
        description: '',
        swVersion: 'v',
        dataFormatVersion: '21',
        version: 0,
        lastModified: '',
        createdAt: '',
        extras: {},
      },
      extras: {},
      categoricalVariables: [],
      valueVariables: [],
      scoreVariables: [
        {
          name: 'quality',
          label: 'Quality (0-5)',
          description: '',
          enabled: true,
          scoreFunction: {
            expression: 'weight/2 + firingAngle',
            variables: [
              { name: 'Weight', symbol: 'weight', source: 'response' },
              {
                name: 'Firing angle',
                symbol: 'firingAngle',
                source: 'factor',
                factorName: 'Firing angle',
              },
            ],
          },
        },
      ],
      constraints: [{ type: 'sum', value: 0, dimensions: [] }],
      optimizerConfig: {
        baseEstimator: 'GP',
        acqFunc: 'EI',
        initialPoints: 3,
        kappa: 1.96,
        xi: 0.01,
      },
      results: {
        id: '',
        plots: [],
        next: [],
        pickled: '',
        expectedMinimum: [],
        extras: {},
      },
      dataPoints: [
        {
          meta: { id: 1, enabled: true, valid: true },
          data: [{ type: 'score', name: 'quality', value: 2.5 }],
          responses: [
            {
              scoreName: 'quality',
              useFunction: true,
              values: [{ symbol: 'weight', value: 150 }],
            },
          ],
        },
      ],
    }
    expect(experimentSchema.safeParse(experiment).success).toBe(true)
  })

  it('still accepts an experiment with neither scoreFunction nor responses', () => {
    const parsed = experimentSchema.safeParse({
      id: 'x',
      changedSinceLastEvaluation: false,
      info: {
        name: 'n',
        description: '',
        swVersion: 'v',
        dataFormatVersion: '21',
        version: 0,
        lastModified: '',
        createdAt: '',
        extras: {},
      },
      extras: {},
      categoricalVariables: [],
      valueVariables: [],
      scoreVariables: [
        {
          name: 'quality',
          label: 'Quality (0-5)',
          description: '',
          enabled: true,
        },
      ],
      constraints: [{ type: 'sum', value: 0, dimensions: [] }],
      optimizerConfig: {
        baseEstimator: 'GP',
        acqFunc: 'EI',
        initialPoints: 3,
        kappa: 1.96,
        xi: 0.01,
      },
      results: {
        id: '',
        plots: [],
        next: [],
        pickled: '',
        expectedMinimum: [],
        extras: {},
      },
      dataPoints: [
        {
          meta: { id: 1, enabled: true, valid: true },
          data: [{ type: 'score', name: 'quality', value: 2.5 }],
        },
      ],
    })
    expect(parsed.success).toBe(true)
  })
})
