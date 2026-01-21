import { ExperimentType, scoreLabels, scoreNames } from '@core/common/types'
import { produce } from 'immer'

// rename scores, change description to empty string, add labels
export const migrateToV18 = (json: ExperimentType): ExperimentType => {
  return produce(
    json,
    (draft: {
      info: { dataFormatVersion: string }
      scoreVariables: {
        name: string
        label?: string
        description: string
        enabled: boolean
      }[]
      dataPoints: {
        data: { name: string; type: string }[]
      }[]
    }) => {
      draft.info.dataFormatVersion = '18'
      draft.scoreVariables = json.scoreVariables.map((s, i) => ({
        name: scoreNames[i] ?? '',
        label: scoreLabels[i] ?? '',
        description: '',
        enabled: s.enabled,
      }))
      draft.dataPoints = json.dataPoints.map(dp => {
        let scoreIndex = 0
        return {
          ...dp,
          data: dp.data.map(d => {
            let newName = d.name
            if (d.type === 'score') {
              newName = scoreNames[scoreIndex] ?? ''
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
