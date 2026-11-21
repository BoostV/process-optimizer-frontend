import { z } from 'zod'
// IMPORTANT!
// Change the current version when doing structural
// changes to any types belonging to ExperimentType

export const currentVersion = '22'

export const scoreNames = ['quality', 'cost'] as const
// Label is shown in UI, name is used in data
export const scoreLabels = ['Quality (0-5)', 'Cost']

export const isValidScoreName = (
  name: string
): name is (typeof scoreNames)[number] => {
  return (scoreNames as readonly string[]).includes(name)
}

// A selected pareto point: one coordinate per optimizer-space dimension,
// matching the backend's front_x_data row shape (mixed numeric/categorical).
export type SelectedPoint = Array<number | string>

const infoSchema = z.object({
  name: z.string(),
  description: z.string(),
  swVersion: z.string(),
  dataFormatVersion: z.literal(currentVersion),
  version: z.number(),
  // ISO8601 timestamp of the last modification; '' for experiments migrated
  // from before v19 (unknown), stamped on the next edit. Used to sort the
  // project list newest-first.
  lastModified: z.string(),
  // ISO8601 timestamp of when the experiment was first created; '' for
  // experiments migrated from before v20 (unknown), set once at creation.
  createdAt: z.string(),
  extras: z.record(z.string(), z.unknown()),
})

export const experimentResultSchema = z.object({
  id: z.string(),
  plots: z.array(z.object({ id: z.string(), plot: z.string() })),
  next: z.array(z.array(z.number().or(z.string()))),
  pickled: z.string(),
  expectedMinimum: z.array(z.array(z.number().or(z.string())).or(z.number())),
  extras: z.record(z.string(), z.unknown()),
})

const categorialVariableSchema = z.object({
  name: z.string(),
  description: z.string(),
  options: z.array(z.string()),
  enabled: z.boolean(),
})

const valueVariableSchema = z.object({
  type: z.literal('discrete').or(z.literal('continuous')),
  name: z.string(),
  description: z.string().prefault(''),
  min: z.number(),
  max: z.number(),
  enabled: z.boolean(),
})

const scoreFunctionVariableSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  // z.enum (not z.union of literals) — at this nesting depth, json-schema-faker's
  // fuzz-testing in migration.test.ts reliably fakes a union-of-literals field as
  // `null`, failing schema validation 100% of the time; z.enum has an identical
  // JSON-schema `enum` (not `anyOf`) shape that the faker handles correctly, with
  // the same runtime validation and inferred `'response' | 'factor'` type.
  source: z.enum(['response', 'factor']),
  factorName: z.string().optional(),
})

const scoreFunctionSchema = z.object({
  expression: z.string(),
  variables: z.array(scoreFunctionVariableSchema),
})

const scoreVariableSchema = z.object({
  name: z.literal(scoreNames[0]).or(z.literal(scoreNames[1])),
  label: z.string(),
  description: z.string(),
  enabled: z.boolean(),
  scoreFunction: scoreFunctionSchema.optional(),
})

const optimizerSchema = z.object({
  baseEstimator: z.string(),
  acqFunc: z.string(),
  initialPoints: z.number(),
  kappa: z.number(),
  xi: z.number(),
})

const dataEntryMetaDataSchema = z.object({
  id: z.coerce.number().prefault(0),
  enabled: z.coerce.boolean().prefault(true),
  valid: z.coerce.boolean().prefault(true),
  description: z.optional(z.string()),
  note: z.optional(z.string()),
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

export const dataPointSchema = z.discriminatedUnion('type', [
  numericDataPoint,
  categoricalDataPoint,
  scoreDataPoint,
])

const responseValueSchema = z.object({
  symbol: z.string(),
  value: z.number(),
})

const scoreResponsesSchema = z.object({
  scoreName: z.literal(scoreNames[0]).or(z.literal(scoreNames[1])),
  useFunction: z.boolean(),
  values: z.array(responseValueSchema),
})

const dataEntrySchema = z.object({
  meta: dataEntryMetaDataSchema,
  data: z.array(dataPointSchema),
  responses: z.array(scoreResponsesSchema).optional(),
})

export const spaceSchema = z
  .object({
    type: z.union([
      z.literal('category'),
      z.literal('discrete'),
      z.literal('continuous'),
    ]),
    name: z.string(),
    from: z.number().optional(),
    to: z.number().optional(),
    categories: z.array(z.string()).optional(),
  })
  .array()

const constraintSchema = z.object({
  type: z.literal('sum'),
  value: z.number(),
  dimensions: z.string().array(),
})

export const experimentSchema = z.object({
  id: z.string(),
  lastEvaluationHash: z.string().optional(),
  changedSinceLastEvaluation: z.boolean(),
  info: infoSchema,
  extras: z.record(z.string(), z.unknown()),
  categoricalVariables: z.array(categorialVariableSchema),
  valueVariables: z.array(valueVariableSchema),
  scoreVariables: z.array(scoreVariableSchema),
  constraints: z.array(constraintSchema),
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
export type SpaceType = z.infer<typeof spaceSchema>
export type CombinedVariableInputType = 'numeric' | 'options'
export type CombinedVariableType = {
  name: string
  description: string
  type: CombinedVariableInputType
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
export type ScoreName = (typeof scoreNames)[number]
export type ScoreFunctionType = z.infer<typeof scoreFunctionSchema>
export type ScoreFunctionVariableType = z.infer<
  typeof scoreFunctionVariableSchema
>
export type ScoreResponsesType = z.infer<typeof scoreResponsesSchema>
export type ResponseValueType = z.infer<typeof responseValueSchema>

// Type guards
export function isExperiment(obj: unknown): obj is ExperimentType {
  return experimentSchema.safeParse(obj).success
}
