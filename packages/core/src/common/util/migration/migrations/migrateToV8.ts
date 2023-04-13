export const migrateToV8 = (json: any): any => {
  return {
    ...json,
    info: { ...json.info, dataFormatVersion: '8' },
    dataPoints: migrateDataPoints(json.dataPoints),
  }
}

const migrateDataPoints = (dataPoints: any[][]) =>
  dataPoints.map((dp, idx) => ({
    meta: { enabled: true, id: idx + 1 },
    data: dp,
  }))
