import {
  ExperimentType,
  scoreLabels,
  scoreNames,
  ScoreVariableType,
} from '@core/common/types'
import { produce } from 'immer'

// TODO Multiobjective - do not use ScoreVariableType because this could change in the future?
type ScoreVariableTypeV17 = Omit<ScoreVariableType, 'name' | 'label'> & {
  name: string
}

// TODO Multiobjective - do not use Experiment because this could change in the future?
export type ExperimentTypeV17 = Omit<
  ExperimentType,
  'info' | 'scoreVariables'
> & {
  info: Omit<ExperimentType['info'], 'dataFormatVersion'> & {
    dataFormatVersion: string
  }
  scoreVariables: ScoreVariableTypeV17[]
}

// rename scores, change description to empty string, add labels
export const migrateToV18 = (json: ExperimentTypeV17): ExperimentType => {
  return produce(json, draft => {
    draft.info.dataFormatVersion = '18'
    draft.scoreVariables = json.scoreVariables
      .slice(0, scoreNames.length)
      .map((s, i) => ({
        name: scoreNames[i] as (typeof scoreNames)[number],
        label: scoreLabels[i] ?? 'score' + (i + 1),
        description: '',
        enabled: s.enabled,
      }))
    draft.dataPoints = json.dataPoints.map(dp => {
      let scoreIndex = 0
      return {
        ...dp,
        data: dp.data
          .filter(d => {
            // only map score data points up to scoreNames.length
            if (d.type === 'score') {
              if (scoreIndex >= scoreNames.length) {
                return false
              }
              scoreIndex++
            }
            return true
          })
          .map(d => {
            let newName = d.name
            if (d.type === 'score') {
              // reset scoreIndex for mapping
              const currentScoreIndex = dp.data
                .slice(0, dp.data.indexOf(d))
                .filter(item => item.type === 'score').length
              newName = scoreNames[
                currentScoreIndex
              ] as (typeof scoreNames)[number]
            }
            return {
              ...d,
              name: newName,
            }
          }),
      }
    })
  }) as unknown as ExperimentType
}
