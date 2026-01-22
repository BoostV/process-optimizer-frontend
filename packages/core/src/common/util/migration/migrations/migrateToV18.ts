import { ExperimentType, scoreLabels, scoreNames } from '@core/common/types'
import { produce } from 'immer'

// Avoid using current ExperimentType as that can change in the future
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

// rename scores, change description to empty string, add labels
export const migrateToV18 = (json: ExperimentTypeV17): ExperimentType => {
  return produce(
    json,
    (draft: {
      info: { dataFormatVersion: string }
      scoreVariables: {
        label?: string
      }[]
      dataPoints: {
        data: { name: string; type: string }[]
      }[]
    }) => {
      draft.info.dataFormatVersion = '18'
      draft.scoreVariables = json.scoreVariables
        .slice(0, scoreNames.length)
        .map((s, i) => ({
          name: scoreNames[i] as (typeof scoreNames)[number],
          label: scoreLabels[i] ?? scoreNames[i],
          description: '',
          enabled: s.enabled,
        }))
      draft.dataPoints = json.dataPoints.map(dp => {
        let scoreIndex = 0
        return {
          ...dp,
          data: dp.data
            .filter(d => {
              // only map score data points up to scoreNames.length
              if (d.type === 'score') {
                if (scoreIndex >= scoreNames.length) {
                  return false
                }
                scoreIndex++
              }
              return true
            })
            .map(d => {
              let newName = d.name
              if (d.type === 'score') {
                // reset scoreIndex for mapping
                const currentScoreIndex = dp.data
                  .slice(0, dp.data.indexOf(d))
                  .filter(item => item.type === 'score').length
                newName = scoreNames[
                  currentScoreIndex
                ] as (typeof scoreNames)[number]
              }
              return {
                ...d,
                name: newName,
              }
            }),
        }
      })
    }
  ) as unknown as ExperimentType
}
