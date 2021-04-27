import { TableDataRow } from "../types/common"

export type DataPointsState = {
  rows: TableDataRow[]
  prevRows: TableDataRow[]
}

export type DataPointsTableAction = 
    DataPointsTableEditToggledAction 
  | DataPointsTableEditCancelledAction
  | DataPointsTableEditedAction
  | DataPointsTableUpdatedAction
  | DataPointsTableRowDeletedAction
  | DataPointsTableRowAddedAction

export const DATA_POINTS_TABLE_EDIT_TOGGLED = 'DATA_POINTS_TABLE_EDIT_TOGGLED'
export const DATA_POINTS_TABLE_EDIT_CANCELLED = 'DATA_POINTS_TABLE_EDIT_CANCELLED'
export const DATA_POINTS_TABLE_EDITED = 'DATA_POINTS_TABLE_EDITED'
export const DATA_POINTS_TABLE_UPDATED = 'DATA_POINTS_TABLE_UPDATED'
export const DATA_POINTS_TABLE_ROW_DELETED = 'DATA_POINTS_TABLE_ROW_DELETED'
export const DATA_POINTS_TABLE_ROW_ADDED = 'DATA_POINTS_TABLE_ROW_ADDED'

export type DataPointsTableEditToggledAction = {
  type: typeof DATA_POINTS_TABLE_EDIT_TOGGLED
  payload: number
}

export type DataPointsTableEditCancelledAction = {
  type: typeof DATA_POINTS_TABLE_EDIT_CANCELLED
  payload: {
    prevRows: TableDataRow[]
    rowIndex: number
  }
}

export type DataPointsTableEditedAction = {
  type: typeof DATA_POINTS_TABLE_EDITED
  payload: {
    value: string
    rowIndex: number
    itemIndex: number
    useArrayForValue: string
  }
}

export type DataPointsTableUpdatedAction = {
  type: typeof DATA_POINTS_TABLE_UPDATED
  payload: TableDataRow[]
}

export type DataPointsTableRowDeletedAction = {
  type: typeof DATA_POINTS_TABLE_ROW_DELETED
  payload: number
}

export type DataPointsTableRowAddedAction = {
  type: typeof DATA_POINTS_TABLE_ROW_ADDED
  payload: TableDataRow
}

export const dataPointsReducer = (state: DataPointsState, action: DataPointsTableAction) => {
  switch (action.type) {
    case DATA_POINTS_TABLE_EDIT_TOGGLED:
      //TODO: save current row in state.prevRows
      return {
        ...state,
        rows: state.rows.map((row, index) => {
          if (index !== action.payload) {
            return row
          } else {
            return {
              ...row,
              isEditMode: !row.isEditMode
            }
          }
        })
      }
    case DATA_POINTS_TABLE_EDIT_CANCELLED:
      const rowIndexEditCancelled = action.payload.rowIndex
      return {
        ...state,
        rows: state.rows.map((row, i) => {
          if (i !== rowIndexEditCancelled) {
            return row
          } else {
            return action.payload.prevRows[rowIndexEditCancelled]
          }
        })
      }
    case DATA_POINTS_TABLE_EDITED:
      return {
        ...state,
        rows: state.rows.map((row, i) => {
          if (i !== action.payload.rowIndex) {
            return row
          } else {
            return {
              ...row,
              dataPoints: row.dataPoints.map((point, k) => {
                if (k !== action.payload.itemIndex) {
                  return point
                } else {
                  return {
                    ...point,
                    value: (point.name === action.payload.useArrayForValue ? [action.payload.value] : action.payload.value)
                  }
                }
              })
            }
          }
        })
      }
      case DATA_POINTS_TABLE_UPDATED:
        return {
          ...state,
          rows: action.payload
        }
      case DATA_POINTS_TABLE_ROW_DELETED:
        let rowsAfterDelete: TableDataRow[] = state.rows.slice()
        rowsAfterDelete.splice(action.payload, 1)
        return { 
          ...state,
          rows: rowsAfterDelete
        }
      case DATA_POINTS_TABLE_ROW_ADDED:
        const rowsAfterAdded: TableDataRow[] = state.rows.slice().map((item, i) => {
          if (state.rows.length - 1 !== i) {
            return item
          } else {
            return {
              ...item,
              isEditMode: false,
              isNew: false,
            }
          }
        })       
        rowsAfterAdded.splice(state.rows.length, 0, action.payload)
        return {
          ...state,
          rows: rowsAfterAdded
        }
  }
}
