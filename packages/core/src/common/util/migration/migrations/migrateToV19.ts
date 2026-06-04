import { ExperimentType } from '@core/common/types'
import { produce } from 'immer'

// v19 adds info.lastModified (ISO8601 timestamp), used to sort the project list
// newest-first. Existing experiments have no known modification time, so it
// starts empty and is stamped on the next edit.
export const migrateToV19 = (json: ExperimentType): ExperimentType =>
  produce(
    json,
    (draft: { info: { dataFormatVersion: string; lastModified?: string } }) => {
      draft.info.dataFormatVersion = '19'
      draft.info.lastModified = ''
    }
  )
