/* eslint-disable @typescript-eslint/no-explicit-any */
export const migrateToV6 = (json: any): any => {
  return {
    ...json,
    changedSinceLastEvaluation: false,
  }
}
