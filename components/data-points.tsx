import { Card, CardContent, Typography } from "@material-ui/core";
import { useEffect, useReducer } from "react";
import { dataPointsReducer, DataPointsState, DATA_POINTS_TABLE_EDITED, DATA_POINTS_TABLE_EDIT_CANCELLED, DATA_POINTS_TABLE_EDIT_TOGGLED, DATA_POINTS_TABLE_ROW_ADDED, DATA_POINTS_TABLE_ROW_DELETED } from "../reducers/data-points-reducer";
import { ExperimentType, DataPointType, TableDataPoint, TableDataRow, CombinedVariableType } from "../types/common";
import { EditableTable } from "./editable-table";

type DataPointProps = {
  experiment: ExperimentType
  onUpdateDataPoints: (dataPoints: DataPointType[][]) => void
}

const SCORE = "score"

export default function DataPoints(props: DataPointProps) {
  const { experiment: { valueVariables, categoricalVariables, dataPoints }, onUpdateDataPoints } = props
  const combinedVariables: CombinedVariableType[] = (valueVariables as CombinedVariableType[]).concat(categoricalVariables as CombinedVariableType[])
  
  const emptyRow: TableDataRow = {
    dataPoints: combinedVariables.map((variable, i) => {
      return {
        name: variable.name,
        value: variable.options ? variable.options[0] : "",
        options: variable.options,
      }
    }).concat({
      name: SCORE,
      value: "0",
      options: undefined,
    }),
    isEditMode: true,
    isNew: true,
  }
  
  const dataPointRows: TableDataRow[] = dataPoints.map((item, i) => {
      return {
        dataPoints: item.map((point: TableDataPoint, k) => {
          return {
            ...point,
            options: combinedVariables[k] ? combinedVariables[k].options : undefined,
          }
        }),
        isEditMode: false,
        isNew: false,
      }
    }
  ).concat(emptyRow as any)

  const initialState: DataPointsState = {
    rows: dataPointRows,
    prevRows: dataPointRows
  }

  const [state, dispatch] = useReducer(dataPointsReducer, initialState)

  useEffect(() => {
    updateDataPoints(state.rows.filter(item => !item.isNew) as TableDataRow[])
  }, [state.rows])

  function toggleEditMode(rowIndex: number) {
    dispatch({ type: DATA_POINTS_TABLE_EDIT_TOGGLED, payload: rowIndex })
  }

  function cancelEdit(rowIndex: number) {
    dispatch({ type: DATA_POINTS_TABLE_EDIT_CANCELLED, payload: rowIndex })
  }

  function edit(editValue: string, rowIndex: number, itemIndex: number) {
    dispatch({ type: DATA_POINTS_TABLE_EDITED, payload: { 
      itemIndex,
      rowIndex,
      useArrayForValue: SCORE,
      value: editValue
    }})
  }

  function deleteRow(rowIndex: number) {
    dispatch({ type: DATA_POINTS_TABLE_ROW_DELETED, payload: rowIndex })
  }

  function addRow(emptyRow: TableDataRow) {
    dispatch({ type: DATA_POINTS_TABLE_ROW_ADDED, payload: emptyRow })
  }

  function updateDataPoints(dataRows: TableDataRow[]) {
    onUpdateDataPoints(dataRows
      .map((item, i) => {
        return item.dataPoints.map(item => {
          return {
            name: item.name,
            value: item.value,
          } as DataPointType
        })
      })
    )
  }

  function onEditConfirm(row: TableDataRow, rowIndex: number) {
    if (row.isNew) {
      addRow(emptyRow)
    } else {
      toggleEditMode(rowIndex)
    }
  }

  return (
    <Card>
      <CardContent>
      
        <Typography variant="h6" gutterBottom>
          Data points
        </Typography>
          
        {combinedVariables.length > 0 &&
          <EditableTable
            rows={state.rows as TableDataRow[]}
            useArrayForValue={SCORE}
            onEdit={(editValue: string, rowIndex: number, itemIndex: number) => edit(editValue, rowIndex, itemIndex)}
            onEditConfirm={(row: TableDataRow, rowIndex: number) => onEditConfirm(row, rowIndex)}
            onEditCancel={(rowIndex: number) => cancelEdit(rowIndex)}
            onToggleEditMode={(rowIndex: number) => toggleEditMode(rowIndex)}
            onDelete={(rowIndex: number) => deleteRow(rowIndex)} />
        }
      </CardContent>
    </Card>
  )
}