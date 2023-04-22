import {
  ValueVariableType,
  CategoricalVariableType,
  ScoreVariableType,
  DataEntry,
  CombinedVariableType,
} from '@boostv/process-optimizer-frontend-core'
import { useCallback, useMemo } from 'react'
import { TableDataPoint, TableDataRow } from '../core'
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
      _editRow(
        valueVariables,
        categoricalVariables,
        scoreVariables,
        dataPoints,
        rowIndex,
        row
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

const convertToDataEntry = (
  valueVariables: ValueVariableType[],
  categoricalVariables: CategoricalVariableType[],
  scoreVariables: ScoreVariableType[],
  row: TableDataRow
) => {
  const data = row.dataPoints.map(dp => {
    if (categoricalVariables.find(cv => cv.name === dp.name) !== undefined) {
      return {
        name: dp.name,
        value: String(dp.value ?? ''),
        type: 'categorical',
      }
    } else if (valueVariables.find(cv => cv.name === dp.name) !== undefined) {
      return {
        name: dp.name,
        value: Number((dp.value ?? '0').replaceAll(',', '.')),
        type: 'numeric',
      }
    } else {
      return {
        name: dp.name,
        value: Number((dp.value ?? '0').replaceAll(',', '.')),
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
        id: original.reduce((id, curr) => Math.max(id + 1, curr.meta.id), 1),
      },
    })
  })

const _editRow = (
  valueVariables: ValueVariableType[],
  categoricalVariables: CategoricalVariableType[],
  scoreVariables: ScoreVariableType[],
  original: DataEntry[],
  rowIndex: number,
  row: TableDataRow
) =>
  produce(original, result => {
    const originalRow = result[rowIndex]
    if (originalRow !== undefined) {
      originalRow.meta.enabled = row.enabled ?? originalRow.meta.enabled
      originalRow.meta.id = row.metaId ?? originalRow.meta.id
      row.dataPoints.forEach(dp => {
        if (dp.value !== undefined) {
          const originalDataPoint = originalRow.data.find(
            odp => odp.name === dp.name
          )
          if (originalDataPoint !== undefined) {
            originalDataPoint.value =
              originalDataPoint.type === 'numeric' ||
              originalDataPoint.type === 'score'
                ? Number(dp.value.replaceAll(',', '.'))
                : String(dp.value)
          } else {
            if (valueVariables.find(v => v.name === dp.name)) {
              originalRow.data.push({
                name: dp.name,
                value: Number(dp.value.replaceAll(',', '.')),
                type: 'numeric',
              })
            } else if (categoricalVariables.find(v => v.name === dp.name)) {
              originalRow.data.push({
                name: dp.name,
                value: String(dp.value),
                type: 'categorical',
              })
            } else if (scoreVariables.find(v => v.name === dp.name)) {
              originalRow.data.push({
                name: dp.name,
                value: Number(dp.value.replaceAll(',', '.')),
                type: 'score',
              })
            }
          }
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
        value: variable.options?.[0],
        options: variable.options,
        tooltip: variable.tooltip,
      }))
      .concat(
        scoreNames.map(s => ({
          name: s,
          value: undefined,
          options: undefined,
          tooltip: undefined,
        }))
      ),
    isNew: true,
  } satisfies TableDataRow
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
          })
        } else {
          vars.push({
            name: v.name,
            value: undefined,
            options: v?.options,
            tooltip: v?.tooltip,
          })
        }
      })
      scoreNames.forEach(v => {
        const existingData = item.data.find(d => d.name === v)
        if (existingData !== undefined) {
          vars.push({
            ...existingData,
            value: String(existingData.value),
          })
        } else {
          vars.push({
            name: v,
            value: undefined,
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
