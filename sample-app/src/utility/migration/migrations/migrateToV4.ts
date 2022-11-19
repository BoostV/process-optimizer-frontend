export const migrateToV4 = (json: any): any => {
  return {
    ...json,
    results: { ...json.results, expectedMinimum: [] },
  }
}
