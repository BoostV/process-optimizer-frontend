import { ExperimentDataInner as ExperimentData } from '@boostv/process-optimizer-frontend-api'
import {
  CategoricalVariableType,
  DataEntry,
  DataPointType,
  ExperimentType,
  ScoreVariableType,
  SpaceType,
  ValueVariableType,
  dataPointSchema,
} from '@core/common/types'

/**
 * Calculate the "space" parameter to send to the API based on the
 * variables defined in the supplied experiment
 *
 * @param experiment
 * @returns the space parameters
 */
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
    return {
      type: 'category',
      name: v.name,
      categories: v.options,
    }
  })
  return numerical.concat(categorical)
}

// const numPat = / [0-9] + /

/**
 * Calculate the data payload to send to the API based on the
 * data entries defined in the supplied experiment
 *
 * @param _categoricalValues
 * @param numericValues
 * @param scoreValues
 * @param dataPoints
 * @returns
 */
export const calculateData = (
  categoricalVariables: CategoricalVariableType[],
  valueVariables: ValueVariableType[],
  scoreVariables: ScoreVariableType[],
  dataPoints: DataEntry[]
): ExperimentData[] => {
  const enabledVariableNames = valueVariables
    .filter(v => v.enabled)
    .map(v => v.name)
    .concat(categoricalVariables.filter(v => v.enabled).map(v => v.name))

  const enabledScoreNames = scoreVariables
    .filter(it => it.enabled)
    .map(it => it.name)

  // const maxScores = getMaxScores(
  //   dataPoints.filter(dp => dp.meta.enabled && dp.meta.valid),
  //   enabledScoreNames
  // )

  return dataPoints
    .filter(dp => dp.meta.enabled && dp.meta.valid)
    .map(dp => dp.data)
    .map(
      (run, _, arr): ExperimentData => ({
        xi: run
          .filter(it => enabledVariableNames.includes(it.name))
          .map(it =>
            it.type === 'numeric' ? Number(it.value) : it.value
          ) as Array<string | number>, // This type cast is valid here because only scores can be number[] and they are filtered out
        yi: run
          .filter(it => enabledScoreNames.includes(it.name))
          .map(it => invertScore(arr, it)),
      })
    )
}

/** for a given score, returns ('max score with the same name' - score)
 * *100 removes floating point errors, e.g. 0.3 - 0.2 = 0.1999...
 * @param dataPoints to look through
 * @param score to invert
 * @returns inverted score (max - score)
 */
export const invertScore = (
  dataPoints: DataPointType[][],
  score: DataPointType
) => {
  const max = Math.max(
    ...dataPoints
      .flatMap(d => d.filter(d => d.name === score.name))
      .map(s => s.value)
      .map(Number)
  )
  return (max * 100 - Number(score.value) * 100) / 100
}

/**
 * Calculate the constraints parameter to send to the API.
 *
 * @param experiment
 * @returns
 */
export const calculateConstraints = (experiment: ExperimentType) =>
  experiment.constraints
    .map(c => ({
      type: c.type,
      value: c.value,
      dimensions: c.dimensions
        .map(d => experiment.valueVariables.findIndex(v => d === v.name))
        .filter(idx => idx !== -1)
        .filter(idx => experiment.valueVariables[idx]?.enabled)
        .filter(idx => experiment.valueVariables[idx]?.type === 'continuous')
        .sort(),
    }))
    .filter(c => (c.type === 'sum' ? c.dimensions.length > 1 : true))
/**
 * Converts a list of DataEntry objects into a CSV string.
 * The output format:
 *
 * id;[data fields];[meta data fields]
 *
 * @param dataPoints to be converted
 * @param separator the separator character (default ';')
 * @param newline the newline character to use (default '\n')
 * @returns a newline separated string representation
 */
export const dataPointsToCSV = (
  dataPoints: DataEntry[],
  separator = ';',
  newline = '\n'
): string => {
  const header = [
    ...new Set(dataPoints.flatMap(d => d.data.map(x => x.name))),
  ].sort((a, b) =>
    dataPoints.reduce(
      (_, curr) =>
        curr.data.map(x => x.name).indexOf(a) -
        curr.data.map(x => x.name).indexOf(b),
      0
    )
  )
  const meta = [
    ...new Set(
      dataPoints.flatMap(d => Object.keys(d.meta).filter(elm => elm !== 'id'))
    ),
  ]
  return dataPoints.length === 0
    ? ''
    : [['id'].concat(header, meta).join(separator)]
        // Generate data lines
        .concat(
          [...dataPoints]
            .map(line => {
              const values = new Map(
                line.data.map(elm => [elm.name, String(elm.value)])
              )
              return { ...line, data: header.map(h => values.get(h) ?? '') }
            })
            .map(
              line =>
                `${line.meta.id}${separator}${line.data
                  .concat(
                    Object.entries(line.meta as object)
                      .filter(e => e[0] !== 'id')
                      .map(e => e[1])
                  )
                  .join(separator)}`
            )
        )
        .filter(s => '' !== s)
        .join(newline)
}

const convertValue = (
  valueHeaders: string[],
  categorialHeaders: string[],
  scoreHeaders: string[],
  name: string,
  value: unknown
): DataPointType => {
  if (valueHeaders.includes(name)) {
    return dataPointSchema.parse({
      name,
      value: Number(value),
      type: 'numeric',
    })
  } else if (categorialHeaders.includes(name) && typeof value === 'string') {
    return dataPointSchema.parse({ name, value: value, type: 'categorical' })
  } else if (scoreHeaders.includes(name)) {
    return dataPointSchema.parse({ name, value: Number(value), type: 'score' })
  }
  throw new Error(`Cannot convert ${name}:${value} to known type`)
}

/**
 * Converts a CSV string to a list of DataEntry elements.
 * The input format:
 * id;[data fields];[meta data fields]
 *
 *
 * @param csv
 * @param valueVariables
 * @param categorialVariables
 * @param scoreVariables
 * @param separator the separator character (default ';')
 * @param newlinePattern a regular expression defining the newline pattern to look for (default '/\r\n|\n/')
 * @returns {DataEntry} list of data points
 */
export const csvToDataPoints = (
  csv: string,
  valueVariables: ValueVariableType[],
  categorialVariables: CategoricalVariableType[],
  scoreVariables: ScoreVariableType[],
  separator = ';',
  newlinePattern = /\r\n|\n/
): DataEntry[] => {
  const valueHeaders = valueVariables.map(x => x.name)
  const categorialHeaders = categorialVariables.map(x => x.name)
  const scoreHeaders = scoreVariables.map(x => x.name)
  const expectedHeader = valueHeaders
    .concat(categorialHeaders)
    .concat(scoreHeaders)
  const lines = csv.split(newlinePattern)
  if ('' === csv || lines.length < 2) return []
  else {
    const header = lines[0]?.split(separator) ?? []
    if (
      header.length >= expectedHeader.length &&
      expectedHeader.every(value => header.includes(value))
    ) {
      const data = lines.slice(1)
      const dataAsKeyValue = data.map(line =>
        line
          .split(separator)
          .map((value, idx) => ({ key: header[idx] ?? '', value }))
      )
      const dataList = dataAsKeyValue.map((line, idx) => ({
        data: line
          .filter(e => expectedHeader.includes(e.key))
          .map(e => ({
            ...convertValue(
              valueHeaders,
              categorialHeaders,
              scoreHeaders,
              e.key,
              e.value
            ),
          }))
          .sort(
            (a, b) =>
              expectedHeader.indexOf(a.name) - expectedHeader.indexOf(b.name)
          ),
        meta: convertToMetaData(
          line.filter(e => !expectedHeader.includes(e.key)),
          idx
        ),
      }))
      const ids = dataList.map(dp => dp.meta.id)
      if (ids.length !== new Set(ids).size) {
        throw new Error(`Duplicate or missing IDs detected in input data`)
      }
      return dataList
    } else {
      throw new Error(
        `Headers does not match ${expectedHeader.join(',')} !== ${header.join(
          ','
        )}`
      )
    }
  }
}

const convertToMetaData = (
  kvList: { key: string; value: string }[],
  idx: number
): DataEntry['meta'] => {
  const parsedMeta = Object.fromEntries(
    kvList.map(e => [e.key.toLocaleLowerCase(), e.value])
  )
  const result: DataEntry['meta'] = {
    ...parsedMeta,
    enabled:
      'enabled' in parsedMeta
        ? parsedMeta['enabled']?.toLowerCase() === 'true'
        : true,
    valid:
      'valid' in parsedMeta
        ? parsedMeta['valid']?.toLowerCase() === 'true'
        : true,
    id: 'id' in parsedMeta ? Number(parsedMeta['id'] ?? idx + 1) : idx + 1,
  }
  return result
}
