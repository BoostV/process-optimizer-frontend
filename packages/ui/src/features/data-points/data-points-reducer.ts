import { TableDataPoint, TableDataRow } from '@ui/features/core/editable-table'
import {
  CategoricalVariableType,
  CombinedVariableType,
  DataEntry,
  ValueVariableType,
} from '@boostv/process-optimizer-frontend-core'
import produce from 'immer'
import { assertUnreachable } from '@boostv/process-optimizer-frontend-core'

interface EditRow {
  row: TableDataRow
  rowIndex: number
}

export interface DataPointsState {
  meta: DataEntry['meta'][]
  rows: TableDataRow[]
  changed: boolean
}

export type DataPointsAction =
  | {
      type: 'setInitialState'
      payload: {
        valueVariables: ValueVariableType[]
        categoricalVariables: CategoricalVariableType[]
        scoreNames: string[]
        data: DataEntry[]
      }
    }
  | {
      type: 'rowAdded'
      payload: TableDataRow
    }
  | {
      type: 'rowDeleted'
      payload: number
    }
  | {
      type: 'rowEdited'
      payload: EditRow
    }

export const dataPointsReducer = produce(
  (state: DataPointsState, action: DataPointsAction) => {
    switch (action.type) {
      case 'setInitialState': {
        const { valueVariables, categoricalVariables, scoreNames, data } =
          action.payload
        state.rows = buildRows(
          valueVariables,
          categoricalVariables,
          scoreNames,
          data
        )
        state.meta = data.map(dp => dp.meta)
        state.changed = false
        break
      }
      case 'rowAdded':
        const metaId = Math.max(0, ...state.meta.map(m => m.id)) + 1
        state.rows.push({ ...action.payload, isNew: false, metaId })
        state.meta.push({
          enabled: true,
          id: metaId,
        })
        state.changed = true
        break
      case 'rowDeleted':
        state.rows.splice(action.payload, 1)
        state.meta.splice(action.payload, 1)
        state.changed = true
        break
      case 'rowEdited':
        state.rows[action.payload.rowIndex] = action.payload.row
        state.changed = true
        break
      default:
        assertUnreachable(action)
    }
  }
)

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
): TableDataRow => {
  return {
    dataPoints: buildCombinedVariables(valueVariables, categoricalVariables)
      .map(variable => {
        return {
          name: variable.name,
          value: variable.options?.[0] ?? '',
          options: variable.options,
          tooltip: variable.tooltip,
        }
      })
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
): TableDataRow[] => {
  const combinedVariables: CombinedVariableType[] = buildCombinedVariables(
    valueVariables,
    categoricalVariables
  )
  const dataPointRows: TableDataRow[] = dataPoints
    .map((item): TableDataRow => {
      const rowData: DataEntry['data'] = item.data.filter(
        dp => !scoreNames.includes(dp.name)
      )
      const vars: TableDataPoint[] = new Array(rowData.length)
      rowData.forEach(v => {
        const idx = combinedVariables.findIndex(it => it.name === v.name)
        vars[idx] = {
          name: v.name,
          value: v.value?.toString(),
          options: combinedVariables[idx]?.options,
          tooltip: combinedVariables[idx]?.tooltip,
        }
      })
      const scores: TableDataPoint[] = item.data
        .filter(dp => scoreNames.includes(dp.name))
        .map(score => ({ name: score.name, value: score.value as string }))
      return {
        isNew: false,
        dataPoints: vars.concat(scores),
        disabled: !item.meta.enabled,
        metaId: item?.meta.id,
        // Uncomment the following line to display a meta data property in the table
        // .concat([{ name: 'id', value: `${item.meta.id}` }]),
      }
    })
    .concat(buildEmptyRow(valueVariables, categoricalVariables, scoreNames))
  return dataPointRows
}
