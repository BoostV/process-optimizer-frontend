import { DataPointType, ExperimentType } from '@core/common/types'

const convert = (
  experiment: ExperimentType,
  dataPoint: DataPointType
): DataPointType => {
  if (experiment.valueVariables.find(v => v.name === dataPoint.name)) {
    return {
      type: 'numeric',
      name: dataPoint.name,
      value: Number(dataPoint.value),
    }
  }
  if (experiment.categoricalVariables.find(v => v.name === dataPoint.name)) {
    return {
      type: 'categorical',
      name: dataPoint.name,
      value: String(dataPoint.value),
    }
  }
  if (experiment.scoreVariables.find(v => v.name === dataPoint.name)) {
    return {
      type: 'score',
      name: dataPoint.name,
      value: Number(dataPoint.value),
    }
  }
  throw new Error(`Could not migrate data point ${JSON.stringify(dataPoint)}`)
}

export const migrateToV13 = (json: ExperimentType): ExperimentType => {
  return {
    ...json,
    info: { ...json.info, dataFormatVersion: '13' },
    dataPoints: json.dataPoints.map(dp => ({
      ...dp,
      data: dp.data.map(d => convert(json, d)),
    })),
  }
}
