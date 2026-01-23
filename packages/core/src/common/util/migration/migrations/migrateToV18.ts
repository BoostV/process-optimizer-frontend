import { ExperimentType, scoreLabels, scoreNames } from '@core/common/types'

// rename scores, change description to empty string, add labels
// Note: Json is v17 but casted as ExperimentType
export const migrateToV18 = (json: ExperimentType): ExperimentType => {
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
