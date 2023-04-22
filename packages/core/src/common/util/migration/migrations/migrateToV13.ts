import { DataPointType, ExperimentType } from '@core/common/types'

function isNumber(data: unknown | number): data is number {
  return (
    (typeof data === 'number' && !isNaN(data)) ||
    (typeof data === 'string' && !isNaN(+data))
  )
}

function asNumber(data: unknown): number {
  if (isNumber(data)) {
    return Number(data)
  }
  return 0
}

const convert = (
  experiment: ExperimentType,
  dataPoint: DataPointType
): DataPointType => {
  if (experiment.valueVariables.find(v => v.name === dataPoint.name)) {
    return {
      type: 'numeric',
      name: dataPoint.name,
      value: asNumber(dataPoint.value),
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
      value: asNumber(dataPoint.value),
    }
  }
  if (dataPoint.value === undefined) {
    return {
      type: 'numeric',
      name: dataPoint.name,
      value: 0,
    }
  }
  if (isNumber(dataPoint.value)) {
    return {
      type: 'numeric',
      name: dataPoint.name,
      value: asNumber(dataPoint.value),
    }
  } else if (Array.isArray(dataPoint.value)) {
    return {
      type: 'categorical',
      name: dataPoint.name,
      value: String(dataPoint.value.join(',')),
    }
  } else if (typeof dataPoint.value === 'string') {
    return {
      type: 'categorical',
      name: dataPoint.name,
      value: String(dataPoint.value),
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
      data: dp.data
        .filter(d => d.value !== undefined && d.value !== null)
        .map(d => convert(json, d)),
    })),
  }
}
