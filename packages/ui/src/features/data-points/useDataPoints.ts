import {
  ValueVariableType,
  CategoricalVariableType,
  ScoreVariableType,
  DataEntry,
  CombinedVariableType,
  CombinedVariableInputType,
  isNumber,
} from '@boostv/process-optimizer-frontend-core'
import { useCallback, useMemo } from 'react'
import { TableDataPoint, TableDataRow, TableDataPointType } from '../core'
import { produce } from 'immer'

export const useDataPoints = (
  valueVariables: ValueVariableType[],
  categoricalVariables: CategoricalVariableType[],
  scoreVariables: ScoreVariableType[],
  dataPoints: DataEntry[]
) => {
  const scoreNames = useMemo(
    () => scoreVariables.filter(it => it.enabled).map(it => it.name),
    [scoreVariables]
  )

  const state = useMemo(
    () =>
      ({
        rows: buildRows(
          valueVariables,
          categoricalVariables,
          scoreNames,
          dataPoints
        ),
        meta: dataPoints.map(dp => dp.meta),
      }) as const,
    [categoricalVariables, dataPoints, scoreNames, valueVariables]
  )

  const addRow = useCallback(
    (row: TableDataRow) =>
      _addRow(
        dataPoints,
        convertToDataEntry(
          valueVariables,
          categoricalVariables,
          scoreVariables,
          row
        )
      ),
    [categoricalVariables, dataPoints, scoreVariables, valueVariables]
  )

  const deleteRow = useCallback(
    (rowIndex: number) => _deleteRow(dataPoints, rowIndex),
    [dataPoints]
  )
  const editRow = useCallback(
    (rowIndex: number, row: TableDataRow) =>
      _editRow(
        dataPoints,
        rowIndex,
        convertToDataEntry(
          valueVariables,
          categoricalVariables,
          scoreVariables,
          row
        )
      ),
    [categoricalVariables, dataPoints, scoreVariables, valueVariables]
  )
  const setEnabledState = useCallback(
    (rowIndex: number, enabled: boolean) =>
      _setEnabledState(dataPoints, rowIndex, enabled),
    [dataPoints]
  )

  return {
    state,
    addRow,
    deleteRow,
    editRow,
    setEnabledState,
  }
}

// undefined values (empty or filtered out) result in a validation error message
const convertToDataEntry = (
  valueVariables: ValueVariableType[],
  categoricalVariables: CategoricalVariableType[],
  scoreVariables: ScoreVariableType[],
  row: TableDataRow
) => {
  const data = row.dataPoints
    // filter out undefined
    .filter(d => d.value !== undefined)
    // replace , with . for value vars and scores
    .map(d => {
      const isNumeric = d.type === 'numeric' || d.type === 'rating'
      return isNumeric
        ? { ...d, value: d.value ? d.value.replaceAll(',', '.') : undefined }
        : d
    })
    // filter out non-number value vars and scores
    .filter(d => {
      const isNumeric = d.type === 'numeric' || d.type === 'rating'
      return !isNumeric || (isNumeric && isNumber(d.value))
    })
    // convert to data entry
    .map(dp => {
      if (dp.value === undefined) {
        throw new Error(
          'Undefined values must be filtered away before conversion to data entries'
        )
      }
      if (categoricalVariables.find(cv => cv.name === dp.name) !== undefined) {
        return {
          name: dp.name,
          value: String(dp.value),
          type: 'categorical',
        }
      } else if (valueVariables.find(cv => cv.name === dp.name) !== undefined) {
        return {
          name: dp.name,
          value: Number(dp.value),
          type: 'numeric',
        }
      } else {
        return {
          name: dp.name,
          value: Number(dp.value),
          type: 'score',
        }
      }
    }) satisfies DataEntry['data']
  const meta = {
    enabled: row.enabled ?? true,
    id: row.metaId ?? 0,
    valid: row.valid ?? true,
  } satisfies DataEntry['meta']
  if (
    data.length <
      valueVariables.length +
        categoricalVariables.length +
        scoreVariables.length -
        1 &&
    scoreVariables[1] !== undefined
  ) {
    data.push({ name: scoreVariables[1].name, value: 0, type: 'score' })
  }
  return { data, meta } satisfies DataEntry
}

const _addRow = (original: DataEntry[], newRow: DataEntry) =>
  produce(original, result => {
    result.push({
      ...newRow,
      data: newRow.data.filter(dp => dp.value !== undefined),
      meta: {
        ...newRow.meta,
        id:
          original.length === 0
            ? 1
            : Math.max(...original.map(o => o.meta.id)) + 1,
      },
    })
  })

const _editRow = (original: DataEntry[], rowIndex: number, row: DataEntry) =>
  produce(original, result => {
    const originalRow = result[rowIndex]
    if (originalRow !== undefined) {
      originalRow.meta.enabled = row.meta.enabled ?? originalRow.meta.enabled
      originalRow.meta.id = row.meta.id ?? originalRow.meta.id
      row.data.forEach(dp => {
        const originalDataPoint = originalRow.data.find(
          odp => odp.name === dp.name
        )
        if (originalDataPoint !== undefined) {
          originalDataPoint.value = dp.value
        } else {
          originalRow.data.push(dp)
        }
      })
      originalRow.data = originalRow.data.filter(d =>
        row.data.map(r => r.name).includes(d.name)
      )
    }
  })

const _setEnabledState = (
  original: DataEntry[],
  rowIndex: number,
  enabled: boolean
) =>
  produce(original, result => {
    const originalRow = result[rowIndex]
    if (originalRow !== undefined) {
      originalRow.meta.enabled = enabled
    }
  })

const _deleteRow = (original: DataEntry[], rowIndex: number) =>
  produce(original, result => {
    result.splice(rowIndex, 1)
  })

const buildCombinedVariables = (
  valueVariables: ValueVariableType[],
  categoricalVariables: CategoricalVariableType[]
): CombinedVariableType[] => {
  return (
    valueVariables.map(v => ({
      ...v,
      tooltip: `[${v.min}, ${v.max}] ${v.type === 'discrete' ? '●' : '○'}`,
      type: 'numeric',
    })) as CombinedVariableType[]
  ).concat(
    categoricalVariables.map(v => ({
      ...v,
      tooltip: `${v.options.length} options`,
      type: 'options',
    })) as CombinedVariableType[]
  )
}

const mapDataPointToTableType = (
  dpType: CombinedVariableInputType
): TableDataPointType => (dpType === 'options' ? 'options' : 'numeric')

const buildEmptyRow = (
  valueVariables: ValueVariableType[],
  categoricalVariables: CategoricalVariableType[],
  scoreNames: string[]
) => {
  return {
    dataPoints: buildCombinedVariables(valueVariables, categoricalVariables)
      .map(variable => ({
        name: variable.name,
        value: variable.options?.[0],
        options: variable.options,
        tooltip: variable.tooltip,
        type: mapDataPointToTableType(variable.type),
      }))
      .concat(
        scoreNames.map((s, i) => ({
          name: s,
          value: undefined,
          options: undefined,
          tooltip: undefined,
          type: i === 0 ? 'rating' : 'numeric',
        }))
      ),
    isNew: true,
  } satisfies TableDataRow
}

export const formatScore = (value: number | string) =>
  value
    .toLocaleString('en-US', {
      minimumFractionDigits: 1,
    })
    .replaceAll(',', '')

const buildRows = (
  valueVariables: ValueVariableType[],
  categoricalVariables: CategoricalVariableType[],
  scoreNames: string[],
  dataPoints: DataEntry[]
) => {
  const combinedVariables = buildCombinedVariables(
    valueVariables,
    categoricalVariables
  )
  const dataPointRows = dataPoints
    .map(item => {
      // const rowData: DataEntry['data'] = item.data.filter(
      //   dp => !scoreNames.includes(dp.name)
      // )
      const vars: TableDataPoint[] = []
      combinedVariables.forEach(v => {
        const existingData = item.data.find(d => d.name === v.name)
        if (existingData !== undefined) {
          vars.push({
            ...existingData,
            value: String(existingData.value),
            options: v?.options,
            tooltip: v?.tooltip,
            type: v.type,
          })
        } else {
          vars.push({
            name: v.name,
            value: undefined,
            options: v?.options,
            tooltip: v?.tooltip,
            type: v.type,
          })
        }
      })
      scoreNames.forEach((v, i) => {
        const existingData = item.data.find(d => d.name === v)
        const type = i === 0 ? 'rating' : 'numeric'
        if (existingData !== undefined) {
          vars.push({
            ...existingData,
            value: formatScore(existingData.value),
            type,
          })
        } else {
          vars.push({
            name: v,
            value: undefined,
            type,
          })
        }
      })

      return {
        isNew: false,
        dataPoints: vars,
        enabled: item.meta.enabled,
        valid: item.meta.valid,
        metaId: item.meta.id,
        // Uncomment the following line to display a meta data property in the table
        // .concat([{ name: 'id', value: `${item.meta.id}` }]),
      } satisfies TableDataRow as TableDataRow
    })
    .concat([buildEmptyRow(valueVariables, categoricalVariables, scoreNames)])

  return dataPointRows
}
