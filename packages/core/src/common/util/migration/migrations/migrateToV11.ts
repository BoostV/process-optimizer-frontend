import { DataEntry, ExperimentType } from '@core/common/types'
import { DataEntryV9, ExperimentTypeV9 } from './migrateToV9'

export const migrateToV11 = (json: ExperimentTypeV9): ExperimentType => {
  return {
    ...json,
    info: { ...json.info, dataFormatVersion: '11' },
    dataPoints: migrateDataPoints(json.dataPoints),
  }
}

const migrateDataPoints = (dataPoints: DataEntryV9[]): DataEntry[] =>
  dataPoints.map((dp, idx) => ({
    meta: { enabled: true, id: idx + 1, valid: true },
    data: dp.data,
  }))
