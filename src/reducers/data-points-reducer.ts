import { TableDataRow } from '../types/common'

interface EditRow {
  row: TableDataRow
  rowIndex: number
}

export interface DataPointsState {
  rows: TableDataRow[]
  changed: boolean
}

export type DataPointsAction =
  | {
      type: 'setInitialState'
      payload: DataPointsState
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

export const dataPointsReducer = (
  state: DataPointsState,
  action: DataPointsAction
): DataPointsState => {
  switch (action.type) {
    case 'setInitialState':
      return { ...action.payload }
    case 'rowAdded':
      return {
        ...state,
        rows: [...state.rows, { ...action.payload, isNew: false }],
        changed: true,
      }
    case 'rowDeleted':
      return {
        ...state,
        rows: [...state.rows.filter((_r, i) => action.payload !== i)],
        changed: true,
      }
    case 'rowEdited':
      return {
        ...state,
        rows: [...state.rows].map((r, i) =>
          action.payload.rowIndex === i ? action.payload.row : r
        ),
        changed: true,
      }
  }
}
