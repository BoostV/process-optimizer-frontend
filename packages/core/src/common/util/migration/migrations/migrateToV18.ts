import {
  defaultScoreName,
  ExperimentType,
  scoreNames,
} from '@core/common/types'
import { produce } from 'immer'

// renames scores [scoreNames[0], scoreNames[1]...] with defaultScoreName as fallback
export const migrateToV18 = (json: ExperimentType): ExperimentType => {
  return produce(
    json,
    (draft: {
      info: { dataFormatVersion: string }
      scoreVariables: { name: string; description: string; enabled: boolean }[]
      dataPoints: {
        data: { name: string; type: string }[]
      }[]
    }) => {
      draft.info.dataFormatVersion = '18'
      draft.scoreVariables = json.scoreVariables.map((s, i) => ({
        name: getScoreName(scoreNames, i),
        description: getScoreName(scoreNames, i),
        enabled: s.enabled,
      }))
      draft.dataPoints = json.dataPoints.map(dp => {
        let scoreIndex = 0
        return {
          ...dp,
          data: dp.data.map(d => {
            let newName = d.name
            if (d.type === 'score') {
              newName = getScoreName(scoreNames, scoreIndex)
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

const getScoreName = (scoreNames: string[], index: number) =>
  scoreNames[index] ?? defaultScoreName
