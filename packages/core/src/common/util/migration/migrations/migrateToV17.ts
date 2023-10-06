import { ExperimentType } from '@core/common/types'
import { produce } from 'immer'

export const migrateToV17 = (json: ExperimentType): ExperimentType => {
  return produce(json, draft => {
    draft.info.dataFormatVersion = '17'
    draft.scoreVariables = json.scoreVariables.map((s, i) => ({
      name: 'Quality' + (i > 0 ? i + 1 : ''),
      description: 'Quality',
      enabled: s.enabled,
    }))
    draft.dataPoints = json.dataPoints.map(dp => ({
      ...dp,
      data: dp.data.map(d => ({
        ...d,
        //replaces 'score' with 'Quality' and keeps the '2' when multiobjective
        name: d.name.replace('score', 'Quality'),
      })),
    }))
  })
}
