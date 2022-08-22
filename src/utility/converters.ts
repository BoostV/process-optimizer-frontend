import { ExperimentData } from '@openapi'
import {
  CategoricalVariableType,
  DataPointType,
  DataPointTypeValue,
  ExperimentType,
  ScoreVariableType,
  SpaceType,
  ValueVariableType,
} from '@/types/common'

export const calculateSpace = (experiment: ExperimentType): SpaceType => {
  const numerical: SpaceType = experiment.valueVariables.map(v => {
    return {
      type: v.type,
      name: v.name,
      from: v.type === 'discrete' ? Math.floor(Number(v.min)) : Number(v.min),
      to: v.type === 'discrete' ? Math.floor(Number(v.max)) : Number(v.max),
    }
  })
  const categorical: SpaceType = experiment.categoricalVariables.map(v => {
    return { type: 'category', name: v.name, categories: v.options }
  })
  return numerical.concat(categorical)
}

// const numPat = / [0-9] + /
export const calculateData = (
  _categoricalValues: CategoricalVariableType[],
  numericValues: ValueVariableType[],
  scoreValues: ScoreVariableType[],
  dataPoints: DataPointType[][]
): ExperimentData[] => {
  const scoreNames = scoreValues.map(it => it.name)
  const enabledScoreNames = scoreValues
    .filter(it => it.enabled)
    .map(it => it.name)
  return dataPoints.map(
    (run): ExperimentData => ({
      xi: run
        .filter(it => !scoreNames.includes(it.name))
        .map(it =>
          numericValues.find(p => p.name === it.name)
            ? Number(it.value)
            : it.value
        ) as Array<string | number>, // This type cast is valid here because only scores can be number[] and they are filtered out
      yi: run
        .filter(it => enabledScoreNames.includes(it.name))
        .map(it => it.value)
        .map(Number),
    })
  )
}

export const dataPointsToCSV = (
  dataPoints: DataPointType[][],
  separator = ';',
  newline = '\n'
): string =>
  dataPoints
    .reduce(
      (prev, curr, idx) =>
        idx === 0 ? [curr.map(item => item.name).join(separator)] : prev,
      [] as string[]
    )
    .concat(
      dataPoints.map(line => line.map(item => item.value).join(separator))
    )
    .filter(s => '' !== s)
    .join(newline)

const convertValue = (
  valueHeaders: string[],
  categorialHeaders: string[],
  name: string,
  value: any
): DataPointTypeValue => {
  if (valueHeaders.includes(name)) {
    return Number(value)
  } else if (categorialHeaders.includes(name)) {
    return value as string
  } else {
    return Number(value)
  }
}

export const csvToDataPoints = (
  csv: string,
  valueVariables: ValueVariableType[],
  categorialVariables: CategoricalVariableType[],
  scoreVariables: ScoreVariableType[],
  separator = ';',
  newlinePattern = /\r\n|\n/
): DataPointType[][] => {
  const valueHeaders = valueVariables.map(x => x.name)
  const categorialHeaders = categorialVariables.map(x => x.name)
  const scoreHeaders = scoreVariables.map(x => x.name)
  const expectedHeader = valueHeaders
    .concat(categorialHeaders)
    .concat(scoreHeaders)
  const lines = csv.split(newlinePattern)
  if ('' === csv || lines.length < 2) return [[]]
  else {
    const header = lines[0]?.split(separator) ?? []
    if (
      header.length >= expectedHeader.length &&
      expectedHeader.every((value, _) => header.includes(value))
    ) {
      const data = lines.slice(1)
      return data
        .map(line =>
          line.split(separator).map(
            (value, idx) =>
              ({
                name: header[idx],
                value: convertValue(
                  valueHeaders,
                  categorialHeaders,
                  header[idx] ?? '',
                  value
                ),
              } as DataPointType)
          )
        )
        .map(data =>
          data.sort(
            (a, b) =>
              expectedHeader.indexOf(a.name) - expectedHeader.indexOf(b.name)
          )
        )
        .map(data => data.filter(x => expectedHeader.includes(x.name)))
    } else {
      throw new Error(
        `Headers does not match ${expectedHeader.join(',')} !== ${header.join(
          ','
        )}`
      )
    }
  }
}
