import { Card, CardContent, Typography } from "@material-ui/core";
import { useEffect, useReducer } from "react";
import { dataPointsReducer, DataPointsState } from "../reducers/data-points-reducer";
import { DataPointType, TableDataPoint, TableDataRow, CombinedVariableType, ValueVariableType, CategoricalVariableType } from "../types/common";
import { EditableTable } from "./editable-table";

type DataPointProps = {
  valueVariables: ValueVariableType[]
  categoricalVariables: CategoricalVariableType[]
  dataPoints: DataPointType[][]
  onUpdateDataPoints: (dataPoints: DataPointType[][]) => void
}

const SCORE = "score"

export default function DataPoints(props: DataPointProps) {
  const { valueVariables, categoricalVariables, dataPoints , onUpdateDataPoints } = props
  const [state, dispatch] = useReducer(dataPointsReducer, { rows: [], prevRows: [] })

  useEffect(() => {
    dispatch({ type: 'setInitialState', payload: buildState()})
  }, [valueVariables, categoricalVariables])

  const buildState = (): DataPointsState => {
    const combinedVariables: CombinedVariableType[] = buildCombinedVariables()
    const emptyRow: TableDataRow = buildEmptyRow()
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

    return {
      rows: dataPointRows,
      prevRows: dataPointRows,
    }
  }

  const buildCombinedVariables = (): CombinedVariableType[]  => {
    return (valueVariables as CombinedVariableType[]).concat(categoricalVariables as CombinedVariableType[])
  }

  const buildEmptyRow = (): TableDataRow => {
    return {
      dataPoints: buildCombinedVariables().map((variable, i) => {
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
  }

  useEffect(() => {
    updateDataPoints(state.rows.filter(item => !item.isNew) as TableDataRow[])
  }, [state.rows])

  function toggleEditMode(rowIndex: number) {
    dispatch({ type: 'DATA_POINTS_TABLE_EDIT_TOGGLED', payload: rowIndex })
  }

  function cancelEdit(rowIndex: number) {
    dispatch({ type: 'DATA_POINTS_TABLE_EDIT_CANCELLED', payload: rowIndex })
  }

  function edit(editValue: string, rowIndex: number, itemIndex: number) {
    dispatch({ type: 'DATA_POINTS_TABLE_EDITED', payload: { 
      itemIndex,
      rowIndex,
      useArrayForValue: SCORE,
      value: editValue
    }})
  }

  function deleteRow(rowIndex: number) {
    dispatch({ type: 'DATA_POINTS_TABLE_ROW_DELETED', payload: rowIndex })
  }

  function addRow(emptyRow: TableDataRow) {
    dispatch({ type: 'DATA_POINTS_TABLE_ROW_ADDED', payload: emptyRow })
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
      addRow(buildEmptyRow())
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
          
        {buildCombinedVariables().length > 0 &&
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