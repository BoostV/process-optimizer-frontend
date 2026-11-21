import { ExperimentType } from '@core/common/types'
import { produce } from 'immer'

// v22 adds an optional per-data-point note (dataEntry.meta.note). It is
// optional, so no data transform is needed — existing experiments validate
// as-is once the version literal is bumped.
export const migrateToV22 = (json: ExperimentType): ExperimentType =>
  produce(json, (draft: { info: { dataFormatVersion: string } }) => {
    draft.info.dataFormatVersion = '22'
  })
