import { ExperimentType } from '@core/common/types'

export const migrateToV12 = (json: ExperimentType): ExperimentType => {
  return {
    ...json,
    info: { ...json.info, dataFormatVersion: '12' },
    lastEvaluationHash: 'never-calculated',
  }
}
