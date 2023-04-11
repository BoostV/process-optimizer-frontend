import {
  CategoricalVariableType,
  OptimizerConfig,
  ScoreVariableType,
  ValueVariableType,
} from '@core/common/types'
import { DataEntryV8, ExperimentTypeV8 } from './migrateToV8'

export type DataEntryV9 = DataEntryV8

export type ExperimentTypeV9 = {
  id: string
  changedSinceLastEvaluation: boolean
  info: {
    name: string
    description: string
    swVersion: string
    dataFormatVersion: '9'
  }
  extras: Record<string, unknown>
  categoricalVariables: CategoricalVariableType[]
  valueVariables: ValueVariableType[]
  scoreVariables: ScoreVariableType[]
  optimizerConfig: OptimizerConfig
  results: {
    id: string
    plots: { id: string; plot: string }[]
    next: (string | number)[][]
    pickled: string
    expectedMinimum: Array<Array<number>>
    extras: object
  }
  dataPoints: DataEntryV9[]
}

export const migrateToV9 = (json: ExperimentTypeV8): ExperimentTypeV9 => {
  return {
    ...json,
    info: { ...json.info, dataFormatVersion: '9' },
    results: {
      ...json.results,
      next: formatNext(json.results.next),
    },
  }
}

export const formatNext = (
  next: (string | number)[] | (string | number)[][]
): (string | number)[][] => {
  const isNestedArray =
    Array.isArray(next) && next[0] !== undefined && Array.isArray(next[0])
  return isNestedArray
    ? (next as (string | number)[][])
    : ([next] as (string | number)[][])
}
