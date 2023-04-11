import { ExperimentType, infoSchema } from '../../../types/common'
import { ExperimentTypeV9 } from './migrateToV9'

export const migrateToV10 = (json: ExperimentTypeV9): ExperimentType => {
  return {
    ...json,
    info: infoSchema.parse({ ...json.info, dataFormatVersion: '10' }),
  }
}
