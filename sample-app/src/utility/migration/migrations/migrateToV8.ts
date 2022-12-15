import {
  CategoricalVariableType,
  DataEntry,
  DataPointType,
  ExperimentResultType,
  ExperimentType,
  OptimizerConfig,
  ScoreVariableType,
  ValueVariableType,
  Info,
} from '@process-optimizer-frontend/core'

type ExperimentTypeV7 = {
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

export const migrateToV8 = (json: ExperimentTypeV7): ExperimentType => {
  return {
    ...json,
    info: { ...json.info, dataFormatVersion: '8' },
    dataPoints: migrateDataPoints(json.dataPoints),
  }
}

const migrateDataPoints = (dataPoints: DataPointType[][]): DataEntry[] =>
  dataPoints.map((dp, idx) => ({
    meta: { enabled: true, id: idx + 1 },
    data: dp,
  }))
