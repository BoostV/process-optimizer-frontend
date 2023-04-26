import { ExperimentType } from '@core/common/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const migrateToV14 = (json: any): ExperimentType => {
  return {
    ...json,
    info: { ...json.info, dataFormatVersion: '14' },
    categoricalVariables: json.categoricalVariables.map(c => ({
      ...c,
      enabled: true,
    })),
    valueVariables: json.valueVariables.map(c => ({
      ...c,
      enabled: true,
    })),
  }
}
