import { ExperimentType } from '@core/common/types'
import { produce } from 'immer'

// v20 adds info.createdAt (ISO8601 creation timestamp). Existing experiments
// have no known creation time, so it starts empty (same strategy as v19's
// lastModified); it is set once at creation for new experiments.
export const migrateToV20 = (json: ExperimentType): ExperimentType =>
  produce(
    json,
    (draft: { info: { dataFormatVersion: string; createdAt?: string } }) => {
      draft.info.dataFormatVersion = '20'
      draft.info.createdAt = ''
    }
  )
