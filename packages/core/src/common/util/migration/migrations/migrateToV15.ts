import { ExperimentType } from '@core/common/types'

export const migrateToV15 = (json: ExperimentType): ExperimentType => {
  return {
    ...json,
    info: { ...json.info, dataFormatVersion: '15' },
    constraints: [
      {
        type: 'sum',
        dimensions: [],
        value: 0,
      },
    ],
  }
}
