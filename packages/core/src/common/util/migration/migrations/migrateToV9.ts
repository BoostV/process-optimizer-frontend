import {
  CategoricalVariableType,
  ExperimentType,
  OptimizerConfig,
  ScoreVariableType,
  ValueVariableType,
  Info,
  DataEntry,
} from '@core/common/types'

type ExperimentTypeV8 = {
  id: string
  changedSinceLastEvaluation: boolean
  info: Info
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

export const migrateToV9 = (json: ExperimentTypeV8): ExperimentType => {
  return {
    ...json,
    info: { ...json.info, dataFormatVersion: '9' },
    results: {
      ...json.results,
      next: formatNext(json.results.next),
    },
  }
}

const formatNext = (
  next: (string | number)[] | (string | number)[][]
): (string | number)[][] => {
  const isNestedArray =
    Array.isArray(next) && next[0] !== undefined && Array.isArray(next[0])
  return isNestedArray
    ? (next as (string | number)[][])
    : ([next] as (string | number)[][])
}
