import { ExperimentType, scoreLabels, scoreNames } from '@core/common/types'

export type ExperimentTypeV17 = {
  id: string
  lastEvaluationHash?: string
  changedSinceLastEvaluation: boolean
  info: {
    name: string
    description: string
    swVersion: string
    dataFormatVersion: '17'
    version: number
    extras: Record<string, unknown>
  }
  extras: Record<string, unknown>
  categoricalVariables: {
    name: string
    description: string
    options: string[]
    enabled: boolean
  }[]
  valueVariables: {
    type: 'discrete' | 'continuous'
    name: string
    description: string
    min: number
    max: number
    enabled: boolean
  }[]
  scoreVariables: {
    name: string
    label?: string
    description: string
    enabled: boolean
  }[]
  constraints: {
    type: 'sum'
    value: number
    dimensions: string[]
  }[]
  optimizerConfig: {
    baseEstimator: string
    acqFunc: string
    initialPoints: number
    kappa: number
    xi: number
  }
  results: {
    id: string
    plots: {
      id: string
      plot: string
    }[]
    next: (number | string)[][]
    pickled: string
    expectedMinimum: ((number | string)[] | number)[]
    extras: Record<string, unknown>
  }
  dataPoints: {
    meta: {
      id: number
      enabled: boolean
      valid: boolean
      description?: string
    }
    data: (
      | {
          type: 'numeric'
          name: string
          value: number
        }
      | {
          type: 'categorical'
          name: string
          value: string
        }
      | {
          type: 'score'
          name: string
          value: number
        }
    )[]
  }[]
}

// migrateToV18 produces an intermediate (v18) experiment — later migrations add
// newer fields (e.g. v19's info.lastModified) and bump dataFormatVersion. Typed
// against the v18 shape rather than the current ExperimentType so it stays valid
// across future version bumps.
type ExperimentTypeV18 = Omit<ExperimentType, 'info'> & {
  info: Omit<ExperimentType['info'], 'dataFormatVersion' | 'lastModified'> & {
    dataFormatVersion: '18'
  }
}

// rename scores, change description to empty string, add labels
export const migrateToV18 = (json: ExperimentTypeV17): ExperimentTypeV18 => {
  return {
    ...json,
    info: {
      ...json.info,
      dataFormatVersion: '18',
    },
    scoreVariables: json.scoreVariables
      .slice(0, scoreNames.length)
      .map((s, i) => ({
        name: scoreNames[i] as (typeof scoreNames)[number],
        label: scoreLabels[i] ?? (scoreNames[i] as (typeof scoreNames)[number]),
        description: '',
        enabled: s.enabled,
      })),
    dataPoints: json.dataPoints.map(dp => {
      let scoreIndex = 0
      return {
        ...dp,
        data: dp.data.flatMap(d => {
          if (d.type === 'score') {
            // empty result is filtered out by flatMap
            return scoreIndex < scoreNames.length
              ? {
                  ...d,
                  name: scoreNames[scoreIndex++] as (typeof scoreNames)[number],
                }
              : []
          }
          return d
        }),
      }
    }),
  }
}
