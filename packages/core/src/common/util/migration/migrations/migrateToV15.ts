import { ExperimentType } from '@core/common/types'
import produce from 'immer'

export const migrateToV15 = (json: ExperimentType): ExperimentType => {
  return produce(json, draft => {
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
  })
}
