import {
  DataEntry,
  DataPointType,
  ExperimentType,
  scoreName,
  ScoreVariableType,
} from '@core/common/types'
import { produce } from 'immer'

/* eslint-disable  @typescript-eslint/no-explicit-any */
export const migrateToV17 = (json: any): ExperimentType => {
  // renames all scores scores to ["scoreName", "scoreName 2"...]
  return produce(
    json,
    (draft: {
      info: { dataFormatVersion: string }
      scoreVariables: ScoreVariableType[]
      dataPoints: DataPointType[]
    }) => {
      draft.info.dataFormatVersion = '17'
      draft.scoreVariables = json.scoreVariables.map(
        (s: ScoreVariableType, i: number) => ({
          name: getScoreName(scoreName, i),
          description: scoreName,
          enabled: s.enabled,
        })
      )
      draft.dataPoints = json.dataPoints.map((dp: DataEntry) => {
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
    }
  ) as unknown as ExperimentType
}

const getScoreName = (name: string, index: number) =>
  name + (index > 0 ? ` ${index + 1}` : '')
