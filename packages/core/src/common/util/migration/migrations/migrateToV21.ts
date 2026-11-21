import { ExperimentType } from '@core/common/types'
import { produce } from 'immer'

// v21 adds optional score-function definitions (scoreVariable.scoreFunction) and
// per-data-point response inputs (dataEntry.responses). Both are optional, so no
// data transform is needed — existing experiments validate as-is once the version
// literal is bumped.
export const migrateToV21 = (json: ExperimentType): ExperimentType =>
  produce(json, (draft: { info: { dataFormatVersion: string } }) => {
    draft.info.dataFormatVersion = '21'
  })
