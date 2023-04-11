// IMPORTANT!
// Change the current version when doing structural
// changes to any types belonging to ExperimentType

import { z } from 'zod'

export const currentVersion = '10'

export const infoSchema = z.object({
  name: z.string(),
  description: z.string(),
  swVersion: z.string(),
  dataFormatVersion: z.literal(currentVersion),
})

export type Info = z.infer<typeof infoSchema>

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

export const experimentResultSchema = z.object({
  id: z.string(),
  plots: z.array(z.object({ id: z.string(), plot: z.string() })),
  next: z.array(z.array(z.number().or(z.string()))),
  pickled: z.string(),
  expectedMinimum: z.array(z.array(z.number()).or(z.number())),
  extras: z.record(z.unknown()),
})

export type ExperimentResultType = z.infer<typeof experimentResultSchema>

export const categorialVariableSchema = z.object({
  name: z.string(),
  description: z.string(),
  options: z.array(z.string()),
})
export type CategoricalVariableType = z.infer<typeof categorialVariableSchema>

export const valueVariableSchema = z.object({
  type: z.literal('discrete').or(z.literal('continuous')),
  name: z.string(),
  description: z.string(),
  min: z.number(),
  max: z.number(),
})
export type ValueVariableType = z.infer<typeof valueVariableSchema>

export const scoreVariableSchema = z.object({
  name: z.string(),
  description: z.string(),
  enabled: z.boolean(),
})
export type ScoreVariableType = z.infer<typeof scoreVariableSchema>

type Override<T, K> = Omit<T, keyof K> & K

export type ValueVariableInputType = Override<
  ValueVariableType,
  {
    min: string
    max: string
  }
>

export type VariableType = CategoricalVariableType | ValueVariableType

export const optimizerSchema = z.object({
  baseEstimator: z.string(),
  acqFunc: z.string(),
  initialPoints: z.number(),
  kappa: z.number(),
  xi: z.number(),
})

export type OptimizerConfig = z.infer<typeof optimizerSchema>

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

export const dataPointValueSchema = z
  .number()
  .or(z.string())
  .or(z.array(z.number()))
export type DataPointTypeValue = z.infer<typeof dataPointValueSchema>
// TODO: Is this ever number or number[]? Maybe in older json-versions
// export type DataPointTypeValue = string | number | number[]
export const genericDataPointSchema = z.object({
  name: z.string(),
  value: dataPointValueSchema,
})

export type CategorialDataPointType = z.infer<typeof genericDataPointSchema>
export type ValueDataPointType = z.infer<typeof genericDataPointSchema>

export const scoreDataPointSchema = z.object({
  name: z.string(),
  value: genericDataPointSchema.or(z.undefined()),
})

export type ScoreDataPointType = z.infer<typeof scoreDataPointSchema>

export const dataPointSchema = genericDataPointSchema.or(scoreDataPointSchema)

export type DataPointType = z.infer<typeof dataPointSchema>

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
