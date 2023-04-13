import { DataEntry, ExperimentType } from '@core/common/types'

export const migrateToV11 = (json: ExperimentType): ExperimentType => {
  return {
    ...json,
    info: { ...json.info, dataFormatVersion: '11' },
    dataPoints: migrateDataPoints(json.dataPoints),
  }
}

const migrateDataPoints = (dataPoints: DataEntry[]): DataEntry[] =>
  dataPoints.map((dp, idx) => ({
    meta: { enabled: true, id: idx + 1, valid: true },
    data: dp.data,
  }))
