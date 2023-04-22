// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const migrateToV12 = (json: any): any => {
  return {
    ...json,
    info: { ...json.info, dataFormatVersion: '12' },
    lastEvaluationHash: 'never-calculated',
  }
}
