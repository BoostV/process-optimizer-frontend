import {
  CategoricalVariableType,
  DataPointType,
  ExperimentResultType,
  OptimizerConfig,
  ScoreVariableType,
  ValueVariableType,
  Info,
} from '@core/common/types'

type ExperimentTypeV5 = {
  id: string
  changedSinceLastEvaluation: boolean
  info: Info
  extras: Record<string, unknown>
  categoricalVariables: CategoricalVariableType[]
  valueVariables: ValueVariableType[]
  scoreVariables: ScoreVariableType[]
  optimizerConfig: OptimizerConfig
  results: ExperimentResultType
  dataPoints: DataPointType[][]
}

export const migrateToV5 = (json: ExperimentTypeV5): ExperimentTypeV5 => {
  return {
    ...json,
    scoreVariables: [
      {
        name: 'score',
        description: 'score',
        enabled: true,
      },
    ],
    dataPoints: json.dataPoints.map(dps =>
      dps.map(dp =>
        dp.name === 'score' && Array.isArray(dp.value)
          ? { ...dp, value: dp.value[0] ?? 0 }
          : dp
      )
    ),
  }
}
