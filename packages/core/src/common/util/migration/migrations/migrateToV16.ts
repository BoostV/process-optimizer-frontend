import { ExperimentType } from '@core/common/types'
import { produce } from 'immer'
/* eslint-disable  @typescript-eslint/no-explicit-any */
export const migrateToV16 = (json: any): ExperimentType => {
  return produce(
    json,
    (draft: {
      info: { dataFormatVersion: string; version: number; extras: unknown }
    }) => {
      draft.info.dataFormatVersion = '16'
      draft.info.version = 0
      draft.info.extras = {}
    }
  ) as unknown as ExperimentType
}
