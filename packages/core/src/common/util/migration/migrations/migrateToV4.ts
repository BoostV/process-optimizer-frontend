// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const migrateToV4 = (json: any): any => {
  return {
    ...json,
    results: { ...json.results, expectedMinimum: [] },
  }
}
