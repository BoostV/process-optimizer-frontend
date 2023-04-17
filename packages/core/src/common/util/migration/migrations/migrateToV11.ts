import { DataEntry } from '@core/common/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const migrateToV11 = (json: any): any => {
  return {
    ...json,
    info: { ...json.info, dataFormatVersion: '11' },
    dataPoints: migrateDataPoints(json.dataPoints),
  }
}

const migrateDataPoints = (dataPoints: DataEntry[]): DataEntry[] =>
  dataPoints.map((dp, idx) => ({
    meta: { ...dp.meta, enabled: true, id: idx + 1, valid: true },
    data: dp.data,
  }))
