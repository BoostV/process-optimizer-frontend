/* eslint-disable @typescript-eslint/no-explicit-any */
export const migrateToV10 = (json: any) => {
  return {
    ...json,
    info: { ...json.info, dataFormatVersion: '10' },
  }
}
