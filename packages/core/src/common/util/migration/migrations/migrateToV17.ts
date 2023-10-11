import { ExperimentType, scoreName } from '@core/common/types'
import { produce } from 'immer'

export const migrateToV17 = (json: ExperimentType): ExperimentType => {
  // renames all scores scores to ["scoreName", "scoreName 2"...]
  return produce(json, draft => {
    draft.info.dataFormatVersion = '17'
    draft.scoreVariables = json.scoreVariables.map((s, i) => ({
      name: getScoreName(scoreName, i),
      description: scoreName,
      enabled: s.enabled,
    }))
    draft.dataPoints = json.dataPoints.map(dp => {
      let scoreIndex = 0
      return {
        ...dp,
        data: dp.data.map(d => {
          let newName = d.name
          if (d.type === 'score') {
            newName = getScoreName(scoreName, scoreIndex)
            scoreIndex++
          }
          return {
            ...d,
            name: newName,
          }
        }),
      }
    })
  })
}

const getScoreName = (name: string, index: number) =>
  name + (index > 0 ? ` ${index + 1}` : '')
