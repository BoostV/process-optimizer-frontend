import { ExperimentType } from '@core/common/types'
import { produce } from 'immer'

export const scoreName17 = 'Quality (0-5)'

export const migrateToV17 = (json: ExperimentType): ExperimentType => {
  // renames all scores scores to ["scoreName", "scoreName 2"...]
  return produce(
    json,
    (draft: {
      info: { dataFormatVersion: string }
      scoreVariables: { name: string; description: string; enabled: boolean }[]
      dataPoints: {
        data: { name: string; type: string }[]
      }[]
    }) => {
      draft.info.dataFormatVersion = '17'
      draft.scoreVariables = json.scoreVariables.map((s, i) => ({
        name: getScoreName(scoreName17, i),
        description: scoreName17,
        enabled: s.enabled,
      }))
      draft.dataPoints = json.dataPoints.map(dp => {
        let scoreIndex = 0
        return {
          ...dp,
          data: dp.data.map(d => {
            let newName = d.name
            if (d.type === 'score') {
              newName = getScoreName(scoreName17, scoreIndex)
              scoreIndex++
            }
            return {
              ...d,
              name: newName,
            }
          }),
        }
      })
    }
  )
}

const getScoreName = (name: string, index: number) =>
  name + (index > 0 ? ` ${index + 1}` : '')
