import { ExperimentTypeV8 } from './migrateToV8'

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
  results: ExperimentResultType
  dataPoints: DataEntry[]
}

// IMPORTANT! All meta data keys MUST be defined as lower case to ensure proper CSV parsing
type MetaDataRequiredKeys = 'enabled' | 'id'
type MetaDataOptionalKeys = 'description'
type MetaDataBoolKeys = 'enabled'
type MetaDataNumericKeys = 'id'

type OptionalKnownMetaData = {
  readonly [key in MetaDataOptionalKeys]?: key extends MetaDataBoolKeys
    ? boolean
    : key extends MetaDataNumericKeys
    ? number
    : string
}

type RequiredKnownMetaData = {
  readonly [key in MetaDataRequiredKeys]: key extends MetaDataBoolKeys
    ? boolean
    : key extends MetaDataNumericKeys
    ? number
    : string
}

type DataEntryMetaData = RequiredKnownMetaData & OptionalKnownMetaData

type DataEntry = {
  meta: DataEntryMetaData
  data: DataPointType[]
}
type DataPointType =
  | CategorialDataPointType
  | ValueDataPointType
  | ScoreDataPointType
// TODO: Is this ever number or number[]? Maybe in older json-versions
type DataPointTypeValue = string | number | number[]

type CategorialDataPointType = {
  name: string
  value: DataPointTypeValue
}
type ValueDataPointType = {
  name: string
  value: DataPointTypeValue
}
type ScoreDataPointType = {
  name: string
  value: DataPointTypeValue | undefined
}

type ExperimentResultType = {
  id: string
  plots: { id: string; plot: string }[]
  next: (number | string)[][]
  pickled: string
  expectedMinimum: Array<Array<number>>
  extras: object
}

type CategoricalVariableType = {
  name: string
  description: string
  options: string[]
}
type ValueVariableType = {
  type: 'discrete' | 'continuous'
  name: string
  description: string
  min: number
  max: number
}
type ScoreVariableType = {
  name: string
  description: string
  enabled: boolean
}

type OptimizerConfig = {
  baseEstimator: string
  acqFunc: string
  initialPoints: number
  kappa: number
  xi: number
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
