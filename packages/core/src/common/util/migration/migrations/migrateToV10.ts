import { ExperimentType, experimentSchema } from '../../../types/common'
import { ExperimentTypeV9 } from './migrateToV9'

export const migrateToV10 = (json: ExperimentTypeV9): ExperimentType => {
  return experimentSchema.parse({
    ...json,
    info: { ...json.info, dataFormatVersion: '10' },
  })
}
