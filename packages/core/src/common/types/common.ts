import { z } from 'zod'
// IMPORTANT!
// Change the current version when doing structural
// changes to any types belonging to ExperimentType

export const currentVersion = '13'

const infoSchema = z.object({
  name: z.string(),
  description: z.string(),
  swVersion: z.string(),
  dataFormatVersion: z.literal(currentVersion),
})

export const experimentResultSchema = z.object({
  id: z.string(),
  plots: z.array(z.object({ id: z.string(), plot: z.string() })),
  next: z.array(z.array(z.number().or(z.string()))),
  pickled: z.string(),
  expectedMinimum: z.array(z.array(z.number().or(z.string())).or(z.number())),
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
  id: z.coerce.number().default(0),
  enabled: z.coerce.boolean().default(true),
  valid: z.coerce.boolean().default(true),
  description: z.optional(z.string()),
})

const numericDataPoint = z.object({
  type: z.literal('numeric'),
  name: z.string(),
  value: z.number(),
})

const categoricalDataPoint = z.object({
  type: z.literal('categorical'),
  name: z.string(),
  value: z.string(),
})

const scoreDataPoint = z.object({
  type: z.literal('score'),
  name: z.string(),
  value: z.number(),
})

// const dataPointSchema = genericDataPointSchema.or(scoreDataPointSchema)
const dataPointSchema = z.discriminatedUnion('type', [
  numericDataPoint,
  categoricalDataPoint,
  scoreDataPoint,
])

const dataEntrySchema = z.object({
  meta: dataEntryMetaDataSchema,
  data: z.array(dataPointSchema),
})

export const experimentSchema = z.object({
  id: z.string(),
  lastEvaluationHash: z.string().optional(),
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

export type DataPointTypeValue = z.infer<typeof dataPointSchema>['value']
export type CategorialDataPointType = z.infer<typeof categoricalDataPoint>
export type ValueDataPointType = z.infer<typeof numericDataPoint>
export type ScoreDataPointType = z.infer<typeof scoreDataPoint>
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
