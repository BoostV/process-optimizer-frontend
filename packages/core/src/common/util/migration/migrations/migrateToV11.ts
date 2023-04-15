import { DataEntry, experimentSchema, ExperimentType } from '@core/common/types'

export const migrateToV11 = (json: ExperimentType): ExperimentType => {
  return experimentSchema.parse({
    ...json,
    info: { ...json.info, dataFormatVersion: '11' },
    dataPoints: migrateDataPoints(json.dataPoints),
  })
}

const migrateDataPoints = (dataPoints: DataEntry[]): DataEntry[] =>
  dataPoints.map((dp, idx) => ({
    meta: { ...dp.meta, enabled: true, id: idx + 1, valid: true },
    data: dp.data,
  }))
