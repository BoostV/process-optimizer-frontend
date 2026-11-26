import { ExperimentType } from '@core/common/types'
import { produce } from 'immer'

// v23 adds a per-score optimization direction (scoreVariables[].maximize).
// Before v23 the direction was implied by the score name: quality was
// maximized and cost was minimized. Keep exactly that for existing data.
export const migrateToV23 = (json: ExperimentType): ExperimentType =>
  produce(
    json,
    (draft: {
      info: { dataFormatVersion: string }
      scoreVariables?: { name: string; maximize?: boolean }[]
    }) => {
      draft.info.dataFormatVersion = '23'
      draft.scoreVariables?.forEach(sv => {
        sv.maximize = sv.name === 'quality'
      })
    }
  )
