import {
  ExperimentType,
  categorialVariableSchema,
  dataPointSchema,
  experimentResultSchema,
  infoSchema,
  optimizerSchema,
  scoreVariableSchema,
  valueVariableSchema,
} from '../../../types/common'
import { ExperimentTypeV9 } from './migrateToV9'

export const migrateToV10 = (json: ExperimentTypeV9): ExperimentType => {
  // console.log(json.results.expectedMinimum)
  return {
    ...json,
    info: infoSchema.parse({ ...json.info, dataFormatVersion: '10' }),
    results: experimentResultSchema.parse(json.results),
    optimizerConfig: optimizerSchema.parse(json.optimizerConfig),
    categoricalVariables: json.categoricalVariables.map(v =>
      categorialVariableSchema.parse(v)
    ),
    valueVariables: json.valueVariables.map(v => valueVariableSchema.parse(v)),
    scoreVariables: json.scoreVariables.map(v => scoreVariableSchema.parse(v)),
    dataPoints: json.dataPoints.map(dp => ({
      ...dp,
      data: dp.data.map(data => dataPointSchema.parse(data)),
    })),
  }
}
