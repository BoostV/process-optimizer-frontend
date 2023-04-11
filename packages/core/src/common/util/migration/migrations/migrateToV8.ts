type ExperimentTypeV7 = {
  id: string
  changedSinceLastEvaluation: boolean
  info: {
    name: string
    description: string
    swVersion: string
    dataFormatVersion: '7'
  }
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
