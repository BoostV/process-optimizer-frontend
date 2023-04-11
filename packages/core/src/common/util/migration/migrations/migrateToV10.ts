import { ExperimentType } from 'common/types'
import { ExperimentTypeV9 } from './migrateToV9'

export const migrateToV10 = (json: ExperimentTypeV9): ExperimentType => {
  return {
    ...json,
    info: { ...json.info, dataFormatVersion: '10' },
  }
}
