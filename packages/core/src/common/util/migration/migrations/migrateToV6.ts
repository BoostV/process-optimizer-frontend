export const migrateToV6 = (json: any): any => {
  return {
    ...json,
    changedSinceLastEvaluation: false,
  }
}
