// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const migrateToV7 = (json: any): any => {
  if (json.optimizerConfig.acqFunc === 'gp_hedge') {
    return {
      ...json,
      optimizerConfig: { ...json.optimizerConfig, acqFunc: 'EI' },
      changedSinceLastEvaluation: true,
    }
  }
  return {
    ...json,
    changedSinceLastEvaluation: false,
  }
}
