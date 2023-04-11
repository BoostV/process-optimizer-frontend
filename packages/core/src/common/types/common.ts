import { z } from 'zod'
// IMPORTANT!
// Change the current version when doing structural
// changes to any types belonging to ExperimentType

export const currentVersion = '10'

const infoSchema = z.object({
  name: z.string(),
  description: z.string(),
  swVersion: z.string(),
  dataFormatVersion: z.literal(currentVersion),
})

const nextSchema = z.array(z.array(z.number().or(z.string())))

export const experimentResultSchema = z.object({
  id: z.string(),
  plots: z.array(z.object({ id: z.string(), plot: z.string() })),
  next: nextSchema,
  pickled: z.string(),
  expectedMinimum: z.array(z.array(z.number()).or(z.number())),
  extras: z.record(z.unknown()),
})

const categorialVariableSchema = z.object({
  name: z.string(),
  description: z.string(),
  options: z.array(z.string()),
})

const valueVariableSchema = z.object({
  type: z.literal('discrete').or(z.literal('continuous')),
  name: z.string(),
  description: z.string().default(''),
  min: z.number(),
  max: z.number(),
})

const scoreVariableSchema = z.object({
  name: z.string(),
  description: z.string(),
  enabled: z.boolean(),
})

const optimizerSchema = z.object({
  baseEstimator: z.string(),
  acqFunc: z.string(),
  initialPoints: z.number(),
  kappa: z.number(),
  xi: z.number(),
})

const dataEntryMetaDataSchema = z.object({
  id: z.number(),
  enabled: z.boolean(),
  description: z.optional(z.string()),
})

const dataPointValueSchema = z.number().or(z.string()).or(z.array(z.number()))

const genericDataPointSchema = z.object({
  name: z.string(),
  value: dataPointValueSchema,
})

const scoreDataPointSchema = z.object({
  name: z.string(),
  value: genericDataPointSchema.or(z.undefined()),
})

const dataPointSchema = genericDataPointSchema.or(scoreDataPointSchema)

const dataEntrySchema = z.object({
  meta: dataEntryMetaDataSchema,
  data: z.array(dataPointSchema),
})

export const experimentSchema = z.object({
  id: z.string(),
  changedSinceLastEvaluation: z.boolean(),
  info: infoSchema,
  extras: z.record(z.unknown()),
  categoricalVariables: z.array(categorialVariableSchema),
  valueVariables: z.array(valueVariableSchema),
  scoreVariables: z.array(scoreVariableSchema),
  optimizerConfig: optimizerSchema,
  results: experimentResultSchema,
  dataPoints: z.array(dataEntrySchema),
})

export type DataPointTypeValue = z.infer<typeof dataPointValueSchema>
export type CategorialDataPointType = z.infer<typeof genericDataPointSchema>
export type ValueDataPointType = z.infer<typeof genericDataPointSchema>
export type ScoreDataPointType = z.infer<typeof scoreDataPointSchema>
export type DataPointType = z.infer<typeof dataPointSchema>
export type DataEntry = z.infer<typeof dataEntrySchema>
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
export type ExperimentType = z.infer<typeof experimentSchema>
export type Info = z.infer<typeof infoSchema>
export type ExperimentResultType = z.infer<typeof experimentResultSchema>
export type CategoricalVariableType = z.infer<typeof categorialVariableSchema>
export type ValueVariableType = z.infer<typeof valueVariableSchema>
export type ScoreVariableType = z.infer<typeof scoreVariableSchema>
export type OptimizerConfig = z.infer<typeof optimizerSchema>

// Type guards
export function isExperiment(obj: unknown): obj is ExperimentType {
  return experimentSchema.safeParse(obj).success
}
