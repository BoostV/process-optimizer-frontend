import { Card, CardContent, CircularProgress, Typography } from "@material-ui/core";
import { useEffect, useReducer } from "react";
import { dataPointsReducer, DataPointsState } from "../reducers/data-points-reducer";
import { DataPointType, TableDataPoint, TableDataRow, CombinedVariableType, ValueVariableType, CategoricalVariableType } from "../types/common";
import { EditableTable } from "./editable-table";

type DataPointProps = {
  valueVariables: ValueVariableType[]
  categoricalVariables: CategoricalVariableType[]
  dataPoints: DataPointType[][]
  onUpdateDataPoints: (dataPoints: DataPointType[][]) => void
  isReversed?: boolean
}

type UpdateFnType = (rowIndex: number, ...args: any[]) => void

const SCORE = "score"

export default function DataPoints(props: DataPointProps) {
  const { valueVariables, categoricalVariables, dataPoints, onUpdateDataPoints, isReversed} = props
  const [state, dispatch] = useReducer(dataPointsReducer, { rows: [], prevRows: [] })
  const isLoadingState = state.rows.length === 0

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

  function edit(rowIndex: number, editValue: string, itemIndex: number) {
    dispatch({ type: 'DATA_POINTS_TABLE_EDITED', payload: { 
      itemIndex,
      rowIndex,
      useArrayForValue: SCORE,
      value: editValue
    }})
  }

  function updateRow(size: number, index: number, isReversed: boolean, updateFn: UpdateFnType, ...argz: any[]) {
    const i = isReversed ? (size - 1) - index : index
    updateFn(i, ...argz)
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
      updateRow(state.rows.length, rowIndex, isReversed, toggleEditMode)
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Data points
        </Typography>
        {buildCombinedVariables().length > 0 && isLoadingState &&
          <CircularProgress size={24}/>
        } 
        {buildCombinedVariables().length > 0 && !isLoadingState &&
          <EditableTable
            rows={[...state.rows].reverse() as TableDataRow[]}
            useArrayForValue={SCORE}
            onEdit={(editValue: string, rowIndex: number, itemIndex: number) => updateRow(state.rows.length, rowIndex, isReversed, edit, editValue, itemIndex)}
            onEditConfirm={(row: TableDataRow, rowIndex: number) => onEditConfirm(row, rowIndex)}
            onEditCancel={(rowIndex: number) => updateRow(state.rows.length, rowIndex, isReversed, cancelEdit)}
            onToggleEditMode={(rowIndex: number) => updateRow(state.rows.length, rowIndex, isReversed, toggleEditMode)}
            onDelete={(rowIndex: number) => updateRow(state.rows.length, rowIndex, isReversed, deleteRow)} />
        }
      </CardContent>
    </Card>
  )
}