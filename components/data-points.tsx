import { Card, CardContent, CircularProgress, IconButton, Typography } from "@material-ui/core";
import { useEffect, useReducer } from "react";
import { useGlobal } from "../context/global-context";
import { dataPointsReducer, DataPointsState } from "../reducers/data-points-reducer";
import { DataPointType, TableDataPoint, TableDataRow, CombinedVariableType, ValueVariableType, CategoricalVariableType } from "../types/common";
import { EditableTable } from "./editable-table";
import ImportExportIcon from '@material-ui/icons/ImportExport';

type DataPointProps = {
  valueVariables: ValueVariableType[]
  categoricalVariables: CategoricalVariableType[]
  dataPoints: DataPointType[][]
  onUpdateDataPoints: (dataPoints: DataPointType[][]) => void
}

const SCORE = "score"

export default function DataPoints(props: DataPointProps) {
  const { valueVariables, categoricalVariables, dataPoints, onUpdateDataPoints} = props
  const [state, dispatch] = useReducer(dataPointsReducer, { rows: [], prevRows: [] })
  const isLoadingState = state.rows.length === 0
  const global = useGlobal()
  const isReversed = global.state.dataPointsReversed

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

  function calcRowIndex(index: number) {
    return isReversed ? state.rows.length - 1 - index : index
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
          <IconButton 
            size="small"
            onClick={() => global.dispatch({ type: 'setDataPointsReversed', payload: !global.state.dataPointsReversed })}>
            <ImportExportIcon fontSize="small" color="primary" />
          </IconButton>
        </Typography>
        {buildCombinedVariables().length > 0 && isLoadingState &&
          <CircularProgress size={24}/>
        } 
        {buildCombinedVariables().length > 0 && !isLoadingState &&
          <EditableTable
            rows={(isReversed ? [...state.rows].reverse() : state.rows) as TableDataRow[]}
            useArrayForValue={SCORE}
            onEdit={(editValue: string, rowIndex: number, itemIndex: number) => edit(calcRowIndex(rowIndex), editValue, itemIndex)}
            onEditConfirm={(row: TableDataRow, rowIndex: number) => onEditConfirm(row, calcRowIndex(rowIndex))}
            onEditCancel={(rowIndex: number) => cancelEdit(calcRowIndex(rowIndex))}
            onToggleEditMode={(rowIndex: number) => toggleEditMode(calcRowIndex(rowIndex))}
            onDelete={(rowIndex: number) => deleteRow(calcRowIndex(rowIndex))} />
        }
      </CardContent>
    </Card>
  )
}