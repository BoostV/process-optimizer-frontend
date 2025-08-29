import { ExperimentType } from '@core/common/types'
import { produce } from 'immer'

/* eslint-disable  @typescript-eslint/no-explicit-any */
export const migrateToV18 = (json: any): ExperimentType => {
  // adds maxEnabledVariablesBeforeSuggestionLimitation
  return produce(
    json,
    (draft: {
      info: { dataFormatVersion: string }
      optimizerConfig: { maxEnabledVariablesBeforeSuggestionLimitation: number }
    }) => {
      draft.info.dataFormatVersion = '18'
      draft.optimizerConfig.maxEnabledVariablesBeforeSuggestionLimitation = 10
    }
  ) as unknown as ExperimentType
}
