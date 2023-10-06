import { ExperimentType, scoreName } from '@core/common/types'
import { produce } from 'immer'

export const migrateToV17 = (json: ExperimentType): ExperimentType => {
  return produce(json, draft => {
    draft.info.dataFormatVersion = '17'
    draft.scoreVariables = json.scoreVariables.map((s, i) => ({
      name: scoreName + (i > 0 ? i + 1 : ''),
      description: scoreName,
      enabled: s.enabled,
    }))
    draft.dataPoints = json.dataPoints.map(dp => ({
      ...dp,
      data: dp.data.map(d => ({
        ...d,
        //replaces 'score' with scoreName and keeps the '2' when multiobjective
        name: d.name.replace('score', scoreName),
      })),
    }))
  })
}
