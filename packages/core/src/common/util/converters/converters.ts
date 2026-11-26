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
  isValidScoreName,
} from '@core/common/types'

/**
 * Calculate the "space" parameter to send to the API based on the
 * variables defined in the supplied experiment
 *
 * @param experiment
 * @returns the space parameters
 */
export const calculateSpace = (experiment: ExperimentType): SpaceType => {
  const numerical: SpaceType = experiment.valueVariables
    .filter(v => v.enabled)
    .map(v => {
      return {
        type: v.type,
        name: v.name,
        from: v.type === 'discrete' ? Math.floor(Number(v.min)) : Number(v.min),
        to: v.type === 'discrete' ? Math.floor(Number(v.max)) : Number(v.max),
      }
    })
  const categorical: SpaceType = experiment.categoricalVariables
    .filter(v => v.enabled)
    .map(v => {
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
  // The optimizer minimizes, so a maximized score is sent negated.
  const maximizedScoreNames: string[] = scoreVariables
    .filter(it => it.maximize)
    .map(it => it.name)

  return dataPoints
    .filter(dp => dp.meta.enabled && dp.meta.valid)
    .map(dp => dp.data)
    .map(
      (run): ExperimentData => ({
        xi: run
          .filter(it => enabledVariableNames.includes(it.name))
          .map(it =>
            it.type === 'numeric' ? Number(it.value) : it.value
          ) as Array<string | number>, // This type cast is valid here because only scores can be number[] and they are filtered out
        yi: run
          .filter(
            it =>
              isValidScoreName(it.name) && enabledScoreNames.includes(it.name)
          )
          .map(it =>
            maximizedScoreNames.includes(it.name)
              ? Number(it.value) * -1
              : Number(it.value)
          ),
      })
    )
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
// RFC-4180: a field containing the separator, a double-quote, or a newline is
// wrapped in double-quotes with internal quotes doubled. Clean fields are left
// untouched, so exports of ordinary data are byte-identical to before.
const escapeCsvField = (value: string, separator: string): string =>
  value.includes(separator) ||
  value.includes('"') ||
  value.includes('\n') ||
  value.includes('\r')
    ? `"${value.replaceAll('"', '""')}"`
    : value

// Split one CSV line into fields, honoring RFC-4180 quotes: a double-quoted
// field may contain the separator, and "" is an escaped quote. (Embedded
// newlines are out of scope — the app's inputs are single-line.)
const parseCsvLine = (line: string, separator: string): string[] => {
  const fields: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        field += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === separator) {
      fields.push(field)
      field = ''
    } else {
      field += ch
    }
  }
  fields.push(field)
  return fields
}

// Column names of the CSV format that are not data: the id and the meta fields.
const reservedCsvHeaders = ['id', 'enabled', 'valid', 'description', 'note']

/**
 * The CSV column header of each score variable: its label, so the file reads
 * like the UI. Falls back to the internal score name ('quality'/'cost') when
 * the label could not be told apart from another column: it is empty, equals a
 * factor name, a meta column, another score's internal name, or the header
 * already given to an earlier score. Comparison ignores case and surrounding
 * spaces. Import accepts either form, so older files keep working.
 *
 * @param scoreVariables
 * @param factorNames names of all value and categorical variables
 */
export const scoreCsvHeaders = (
  scoreVariables: ScoreVariableType[],
  factorNames: string[]
): Record<string, string> => {
  const norm = (name: string) => name.trim().toLowerCase()
  const taken = new Set([...factorNames, ...reservedCsvHeaders].map(norm))
  const headers: Record<string, string> = {}
  scoreVariables.forEach(sv => {
    const label = sv.label.trim()
    const otherInternalNames = scoreVariables
      .filter(other => other.name !== sv.name)
      .map(other => norm(other.name))
    const usable =
      label !== '' &&
      !taken.has(norm(label)) &&
      !otherInternalNames.includes(norm(label))
    const header = usable ? label : sv.name
    headers[sv.name] = header
    taken.add(norm(header))
  })
  return headers
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
 * @param scoreVariables when given, score columns are headed by the score
 *   labels (see scoreCsvHeaders) instead of the internal score names
 * @returns a newline separated string representation
 */
export const dataPointsToCSV = (
  dataPoints: DataEntry[],
  separator = ';',
  newline = '\n',
  scoreVariables: ScoreVariableType[] = []
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
  const scoreColumnNames = new Set(
    dataPoints.flatMap(d =>
      d.data.filter(x => x.type === 'score').map(x => x.name)
    )
  )
  const scoreHeaders = scoreCsvHeaders(
    scoreVariables,
    header.filter(h => !scoreColumnNames.has(h))
  )
  const displayHeader = header.map(h =>
    scoreColumnNames.has(h) ? (scoreHeaders[h] ?? h) : h
  )
  return dataPoints.length === 0
    ? ''
    : [
        ['id', ...displayHeader, ...meta]
          .map(field => escapeCsvField(field, separator))
          .join(separator),
      ]
        // Generate data lines
        .concat(
          [...dataPoints]
            .map(line => {
              const values = new Map(
                line.data.map(elm => [elm.name, String(elm.value)])
              )
              return { ...line, data: header.map(h => values.get(h) ?? '') }
            })
            .map(line =>
              // Meta values are emitted in the `meta` header (union) order —
              // looked up by key, not the row's own key order — so rows with
              // different optional meta keys (e.g. note vs description) stay
              // column-aligned on re-import.
              [
                String(line.meta.id),
                ...line.data,
                ...meta.map(key => {
                  const value = (line.meta as Record<string, unknown>)[key]
                  return value === undefined ? '' : String(value)
                }),
              ]
                .map(field => escapeCsvField(field, separator))
                .join(separator)
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
    .map(e => e.trim())
  // A score column may be headed by the score's label (as exported) or by its
  // internal name (older files). Translate label headers to internal names.
  const scoreLabelHeaders = scoreCsvHeaders(
    scoreVariables,
    valueHeaders.concat(categorialHeaders)
  )
  const labelToName = new Map(
    scoreVariables.map(sv => [scoreLabelHeaders[sv.name] ?? sv.name, sv.name])
  )
  const lines = csv.split(newlinePattern)
  if ('' === csv || lines.length < 2) return []
  else {
    const fileHeader = parseCsvLine(lines[0] ?? '', separator).map(h =>
      h.trim()
    )
    const header = fileHeader.map(h =>
      // An internal name already present in the file wins over a label.
      labelToName.has(h) && !fileHeader.includes(labelToName.get(h) ?? '')
        ? (labelToName.get(h) ?? h)
        : h
    )
    if (
      header.length >= expectedHeader.length &&
      expectedHeader.every(value => header.includes(value))
    ) {
      const data = lines.slice(1)
      const dataAsKeyValue = data.map(line =>
        parseCsvLine(line, separator).map((value, idx) => ({
          key: header[idx] ?? '',
          value,
        }))
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
        `Headers does not match ${valueHeaders
          .concat(categorialHeaders)
          .concat(
            scoreVariables.map(sv => scoreLabelHeaders[sv.name] ?? sv.name)
          )
          .map(e => e.trim())
          .join(',')} !== ${fileHeader.join(',')}`
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
  if (result.note === '' || result.note === undefined) {
    delete result.note
  }
  return result
}
