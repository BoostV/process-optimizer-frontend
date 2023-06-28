import { ExperimentType } from '@core/common/types'
import produce from 'immer'

export const migrateToV16 = (json: ExperimentType): ExperimentType => {
  return produce(json, draft => {
    draft.info.dataFormatVersion = '16'
    draft.info.version = 0
  })
}
