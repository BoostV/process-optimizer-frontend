import {
  CategoricalVariableType,
  DataEntry,
  DataPointType,
  ExperimentResultType,
  OptimizerConfig,
  ScoreVariableType,
  ValueVariableType,
  Info,
} from 'common/types'

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

export type ExperimentTypeV8 = {
  id: string
  changedSinceLastEvaluation: boolean
  info: {
    name: string
    description: string
    swVersion: string
    dataFormatVersion: '8'
  }
  extras: Record<string, unknown>
  categoricalVariables: CategoricalVariableType[]
  valueVariables: ValueVariableType[]
  scoreVariables: ScoreVariableType[]
  optimizerConfig: OptimizerConfig
  results: {
    id: string
    plots: { id: string; plot: string }[]
    next: (string | number)[] | (number | string)[][]
    pickled: string
    expectedMinimum: Array<Array<number>>
    extras: object
  }
  dataPoints: DataEntry[]
}

export const migrateToV8 = (json: ExperimentTypeV7): ExperimentTypeV8 => {
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
