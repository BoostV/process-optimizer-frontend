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

  const convertEditableRowToExperimentRow = useCallback(
    (row: TableDataRow) => {
      const vars = row.dataPoints.filter(dp => !scoreNames.includes(dp.name))
      const scores = row.dataPoints
        .filter(dp => scoreNames.includes(dp.name))
        .map(s => ({
          name: s.name,
          value: s.value,
        }))
      return vars
        .map(dp => ({
          name: dp.name,
          value: dp.value,
        }))
        .concat(scores) as DataEntry['data']
    },
    [scoreNames]
  )

  const updateDataPoints = useCallback(
    (meta: DataEntry['meta'][], rows: TableDataRow[]) => {
      const zipped = meta.map((m, idx) => [
        m,
        convertEditableRowToExperimentRow(rows.filter(e => !e.isNew)[idx]),
      ])
      return zipped.map(e => ({ meta: e[0], data: e[1] })) as DataEntry[]
    },
    [convertEditableRowToExperimentRow]
  )

  const addRow = useCallback(
    (row: TableDataRow) =>
      produce(state, draft => {
        const metaId = Math.max(0, ...draft.meta.map(m => m.id)) + 1
        draft.rows.push(
          mapRowNumericValues(categoricalVariables, {
            ...row,
            isNew: false,
            metaId,
          })
        )
        draft.meta.push({
          enabled: true,
          valid: true,
          id: metaId,
        })
      }),
    [categoricalVariables, state]
  )

  const deleteRow = useCallback(
    (idx: number) =>
      produce(state, draft => {
        state.rows.splice(idx, 1)
        state.meta.splice(idx, 1)
      }),
    [state]
  )

  const editRow = useCallback(
    (idx: number, row: TableDataRow) =>
      produce(state, draft => {
        draft.rows[idx] = mapRowNumericValues(categoricalVariables, row)
      }),
    [categoricalVariables, state]
  )

  const setRowIsEnabled = useCallback(
    (idx: number, enabled: boolean) =>
      produce(state, draft => {
        const newMeta: DataEntry['meta'] | undefined = draft.meta[idx]
        if (newMeta !== undefined) {
          draft.meta[idx] = {
            ...newMeta,
            enabled,
          }
        }
      }),
    [state]
  )

  return {
    state,
    addRow,
    deleteRow,
    editRow,
    setRowIsEnabled,
    updateDataPoints,
  }
}

/// OLD HELPERS
const mapRowNumericValues = (
  categoricalVariables: CategoricalVariableType[],
  row: TableDataRow
) => ({
  ...row,
  dataPoints: R.map(row.dataPoints, r =>
    R.map(categoricalVariables, c => c.name).includes(r.name)
      ? r
      : {
          ...r,
          value: String(Number(r.value?.replace(',', '.'))),
        }
  ),
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
        R.map(score => ({ name: score.name, value: String(score.value) }))
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
