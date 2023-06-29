import { ExperimentType } from '@core/common/types'
import { produce } from 'immer'
/* eslint-disable  @typescript-eslint/no-explicit-any */
export const migrateToV15 = (json: any): ExperimentType =>
  produce(
    json,
    (draft: {
      info: { dataFormatVersion: string }
      constraints: { type: string; dimensions: never[]; value: number }[]
      optimizerConfig: { initialPoints: number; kappa: number; xi: number }
    }) => {
      draft.info.dataFormatVersion = '15'
      draft.constraints = [
        {
          type: 'sum',
          dimensions: [],
          value: 0,
        },
      ]
      draft.optimizerConfig.initialPoints = Number(
        json.optimizerConfig.initialPoints
      )
      draft.optimizerConfig.kappa = Number(json.optimizerConfig.kappa)
      draft.optimizerConfig.xi = Number(json.optimizerConfig.xi)
    }
  ) as unknown as ExperimentType
