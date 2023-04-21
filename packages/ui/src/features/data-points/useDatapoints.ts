import {
  ValueVariableType,
  CategoricalVariableType,
  ScoreVariableType,
  DataEntry,
  CombinedVariableType,
} from '@boostv/process-optimizer-frontend-core'
import { useCallback, useMemo } from 'react'
import * as R from 'remeda'
import { TableDataRow } from '../core'
import produce from 'immer'

export const useDatapoints = (
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
      } as const),
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
      _editRow(dataPoints, rowIndex, row),
    [dataPoints]
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

const convertToDataEntry = (
  valueVariables: ValueVariableType[],
  categoricalVariables: CategoricalVariableType[],
  scoreVariables: ScoreVariableType[],
  row: TableDataRow
) => {
  const data = row.dataPoints.map(dp => ({
    name: dp.name,
    value:
      categoricalVariables.find(cv => cv.name === dp.name) !== undefined
        ? String(dp.value ?? '')
        : Number(dp.value ?? 0),
  })) satisfies DataEntry['data']
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
    data.push({ name: scoreVariables[1].name, value: 0 })
  }
  return { data, meta } satisfies DataEntry
}

const _addRow = (original: DataEntry[], newRow: DataEntry) =>
  produce(original, result => {
    result.push(newRow)
  })

const _editRow = (original: DataEntry[], rowIndex: number, row: TableDataRow) =>
  produce(original, result => {
    const originalRow = result[rowIndex]
    if (originalRow !== undefined) {
      originalRow.meta.enabled = row.enabled ?? originalRow.meta.enabled
      originalRow.meta.id = row.metaId ?? originalRow.meta.id
      row.dataPoints.forEach(dp => {
        const originalDataPoint = originalRow.data.find(
          odp => odp.name === dp.name
        )
        const type = typeof originalDataPoint
        if (originalDataPoint !== undefined) {
          originalDataPoint.value =
            type === 'number' ? Number(dp.value ?? 0) : String(dp.value ?? '')
        }
      })
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
    })) as CombinedVariableType[]
  ).concat(
    categoricalVariables.map(v => ({
      ...v,
      tooltip: `${v.options.length} options`,
    })) as CombinedVariableType[]
  )
}

const buildEmptyRow = (
  valueVariables: ValueVariableType[],
  categoricalVariables: CategoricalVariableType[],
  scoreNames: string[]
) => {
  return {
    dataPoints: buildCombinedVariables(valueVariables, categoricalVariables)
      .map(variable => ({
        name: variable.name,
        value: variable.options?.[0] ?? '',
        options: variable.options,
        tooltip: variable.tooltip,
      }))
      .concat(
        scoreNames.map(s => ({
          name: s,
          value: '',
          options: undefined,
          tooltip: undefined,
        }))
      ),
    isNew: true,
  }
}

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
  const dataPointRows = R.concat(
    R.map(dataPoints, item => {
      const rowData: DataEntry['data'] = item.data.filter(
        dp => !scoreNames.includes(dp.name)
      )
      const vars = new Array(rowData.length)
      rowData.forEach(v => {
        const idx = combinedVariables.findIndex(it => it.name === v.name)
        vars[idx] = {
          name: v.name,
          value: v.value?.toString(),
          options: combinedVariables[idx]?.options,
          tooltip: combinedVariables[idx]?.tooltip,
        }
      })
      const scores = R.pipe(
        item.data,
        R.filter(dp => scoreNames.includes(dp.name)),
        R.map(score => ({ name: score.name, value: String(score.value ?? '') }))
      )
      return {
        isNew: false,
        dataPoints: vars.concat(scores),
        enabled: item.meta.enabled,
        valid: item.meta.valid,
        metaId: item?.meta.id,
        // Uncomment the following line to display a meta data property in the table
        // .concat([{ name: 'id', value: `${item.meta.id}` }]),
      }
    }),
    [buildEmptyRow(valueVariables, categoricalVariables, scoreNames)]
  )
  return dataPointRows
}
