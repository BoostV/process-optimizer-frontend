import { ExperimentDataInner as ExperimentData } from '@process-optimizer-frontend/api'
import {
  CategoricalVariableType,
  DataEntry,
  DataPointTypeValue,
  ExperimentType,
  ScoreVariableType,
  SpaceType,
  ValueVariableType,
} from '@process-optimizer-frontend/core/src/common/types/common'
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
    return { type: 'category', name: v.name, categories: v.options }
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
  _categoricalValues: CategoricalVariableType[],
  numericValues: ValueVariableType[],
  scoreValues: ScoreVariableType[],
  dataPoints: DataEntry[]
): ExperimentData[] => {
  const scoreNames = scoreValues.map(it => it.name)
  const enabledScoreNames = scoreValues
    .filter(it => it.enabled)
    .map(it => it.name)
  return dataPoints
    .filter(dp => dp.meta.enabled)
    .map(dp => dp.data)
    .map(
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
): string =>
  dataPoints
    // Generate headers
    .reduce(
      (prev, curr, idx) =>
        idx === 0
          ? [
              // Add ID column as first column
              ['id']
                .concat(
                  curr.data
                    .map(item => item.name)
                    .concat(
                      Object.entries(curr.meta)
                        .filter(e => e[0] !== 'id')
                        .map(e => e[0])
                    )
                )
                .join(separator),
            ]
          : prev,
      [] as string[]
    )
    // Generate data lines
    .concat(
      [...dataPoints]
        // .sort((a, b) => a.meta.id - b.meta.id)
        .map(
          line =>
            `${line.meta.id}${separator}${line.data
              .map(item => item.value)
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
            name: e.key,
            value: convertValue(
              valueHeaders,
              categorialHeaders,
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
    id: 'id' in parsedMeta ? Number(parsedMeta['id'] ?? idx + 1) : idx + 1,
  }
  return result
}
