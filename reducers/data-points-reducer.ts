import { TableDataRow } from "../types/common"

export type DataPointsState = {
  rows: TableDataRow[]
  prevRows: TableDataRow[]
  changed?: boolean
  hasTempChange?: boolean
}

export type DataPointsTableAction = {
  type: 'DATA_POINTS_TABLE_EDIT_TOGGLED'
  payload: number
}
| {
  type: 'DATA_POINTS_TABLE_EDIT_CANCELLED'
  payload: number
}
| {
  type: 'DATA_POINTS_TABLE_EDITED'
  payload: {
    value: string
    rowIndex: number
    itemIndex: number
  }
}
| {
  type: 'DATA_POINTS_TABLE_UPDATED'
  payload: TableDataRow[]
}
| {
  type: 'DATA_POINTS_TABLE_ROW_DELETED'
  payload: number
}
| {
  type: 'DATA_POINTS_TABLE_ROW_ADDED'
  payload: TableDataRow
}
| {
  type: 'setInitialState'
  payload: DataPointsState
}

export const dataPointsReducer = (state: DataPointsState, action: DataPointsTableAction): DataPointsState => {
  switch (action.type) {
    case 'setInitialState':
      return {...action.payload, changed: false}
    case 'DATA_POINTS_TABLE_EDIT_TOGGLED':
      const rowIndexEditToggled = action.payload
      return {
        ...state,
        changed: state.hasTempChange,
        hasTempChange: false,
        prevRows: state.prevRows.map((row, i) => {
          if (i !== rowIndexEditToggled) {
            return row
          } else {
            return state.rows[rowIndexEditToggled]
          }
        }),
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
    case 'DATA_POINTS_TABLE_EDIT_CANCELLED':
      const rowIndexEditCancelled = action.payload
      return {
        ...state,
        hasTempChange: false,
        changed: false,
        rows: state.rows.map((row, i) => {
          if (i !== rowIndexEditCancelled) {
            return row
          } else {
            return {
              ...state.prevRows[rowIndexEditCancelled],
              isEditMode: row.isNew
            }
          }
        })
      }
    case 'DATA_POINTS_TABLE_EDITED':
      return {
        ...state,
        hasTempChange: true,
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
                    value: action.payload.value
                  }
                }
              })
            }
          }
        })
      }
      case 'DATA_POINTS_TABLE_UPDATED':
        return {
          ...state,
          rows: action.payload
        }
      case 'DATA_POINTS_TABLE_ROW_DELETED':
        let rowsAfterDelete: TableDataRow[] = state.rows.slice()
        rowsAfterDelete.splice(action.payload, 1)

        let preRowsAfterDelete: TableDataRow[] = state.prevRows.slice()
        preRowsAfterDelete.splice(action.payload, 1)
        return { 
          ...state,
          changed: true,
          prevRows: preRowsAfterDelete,
          rows: rowsAfterDelete
        }
      case 'DATA_POINTS_TABLE_ROW_ADDED':
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

        const preRowsAfterAdded: TableDataRow[] = state.prevRows.slice().map((item, i) => {
          if (state.prevRows.length - 1 !== i) {
            return item
          } else {
            return {
              ...item,
              isEditMode: false,
              isNew: false,
            }
          }
        })       
        preRowsAfterAdded.splice(state.rows.length, 0, action.payload)
        return {
          ...state,
          changed: true,
          prevRows: preRowsAfterAdded,
          rows: rowsAfterAdded
        }
  }
}
