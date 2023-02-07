// IMPORTANT!
// Change the current version when doing structural
// changes to any types belonging to ExperimentType

export const currentVersion = '8'

export type Info = {
  name: string
  description: string
  swVersion: string
  dataFormatVersion: typeof currentVersion
}

export type ExperimentType = {
  id: string
  changedSinceLastEvaluation: boolean
  info: Info
  extras: Record<string, unknown>
  categoricalVariables: CategoricalVariableType[]
  valueVariables: ValueVariableType[]
  scoreVariables: ScoreVariableType[]
  optimizerConfig: OptimizerConfig
  results: ExperimentResultType
  dataPoints: DataEntry[]
}

export type ExperimentResultType = {
  id: string
  plots: { id: string; plot: string }[]
  next: (number | string)[] | (number | string)[][]
  pickled: string
  expectedMinimum: Array<Array<number>>
  extras: object
}

export type CategoricalVariableType = {
  name: string
  description: string
  options: string[]
}
export type ValueVariableType = {
  type: 'discrete' | 'continuous'
  name: string
  description: string
  min: number
  max: number
}
export type ScoreVariableType = {
  name: string
  description: string
  enabled: boolean
}

type Override<T, K> = Omit<T, keyof K> & K

export type ValueVariableInputType = Override<
  ValueVariableType,
  {
    min: string
    max: string
  }
>

export type VariableType = CategoricalVariableType | ValueVariableType

export type OptimizerConfig = {
  baseEstimator: string
  acqFunc: string
  initialPoints: number
  kappa: number
  xi: number
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

export type DataEntry = {
  meta: DataEntryMetaData
  data: DataPointType[]
}

export type DataPointType =
  | CategorialDataPointType
  | ValueDataPointType
  | ScoreDataPointType
export type DataPointTypeValue = string | number | number[]

export type CategorialDataPointType = {
  name: string
  value: DataPointTypeValue
}
export type ValueDataPointType = {
  name: string
  value: DataPointTypeValue
}
export type ScoreDataPointType = {
  name: string
  value: DataPointTypeValue | undefined
}

export type SpaceType = {
  type: string
  name: string
  from?: number
  to?: number
  categories?: string[]
}[]

export type CombinedVariableType = {
  name: string
  description: string
  tooltip?: string
  options?: string[]
}

// Type guards

export function isExperiment(obj: unknown): obj is ExperimentType {
  return (obj as ExperimentType)?.info?.dataFormatVersion === currentVersion
}
