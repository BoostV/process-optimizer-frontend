import { ExperimentType, scoreLabels, scoreNames } from '@core/common/types'
import sampleV17 from '../data-formats/17.json'

// Use 17.json to define ExperimentTypeV17. Explicitly define string literals to make ts happy.
// Avoid using current ExperimentType as that can change in the future
type ExperimentTypeV17 = Omit<
  typeof sampleV17,
  'valueVariables' | 'constraints' | 'dataPoints'
> & {
  valueVariables: (Omit<(typeof sampleV17.valueVariables)[number], 'type'> & {
    type: 'discrete' | 'continuous'
  })[]
  constraints: (Omit<(typeof sampleV17.constraints)[number], 'type'> & {
    type: 'sum'
  })[]
  dataPoints: (Omit<(typeof sampleV17.dataPoints)[number], 'data'> & {
    data: (
      | {
          type: 'numeric' | 'score'
          name: string
          value: number
        }
      | {
          type: 'categorical'
          name: string
          value: string
        }
    )[]
  })[]
}

// rename scores, change description to empty string, add labels
export const migrateToV18 = (json: ExperimentTypeV17): ExperimentType => {
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
