import { CircularProgress, IconButton, Box, Tooltip } from "@material-ui/core";
import { useEffect, useReducer } from "react";
import { useGlobal } from "../context/global-context";
import { dataPointsReducer, DataPointsState } from "../reducers/data-points-reducer";
import { DataPointType, TableDataPoint, TableDataRow, CombinedVariableType, ValueVariableType, CategoricalVariableType } from "../types/common";
import { EditableTable } from "./editable-table";
import SwapVertIcon from '@material-ui/icons/SwapVert';
import { TitleCard } from './title-card';
import useStyles from "../styles/data-points.style";
import DownloadCSVButton from "./download-csv-button";
import UploadCSVButton from "./upload-csv-button";

type DataPointProps = {
  valueVariables: ValueVariableType[]
  categoricalVariables: CategoricalVariableType[]
  dataPoints: DataPointType[][]
  onUpdateDataPoints: (dataPoints: DataPointType[][]) => void
}

type UpdateFnType = (rowIndex: number, ...args: any[]) => void

const SCORE = "score"

export default function DataPoints(props: DataPointProps) {
  const { valueVariables, categoricalVariables, dataPoints, onUpdateDataPoints } = props
  const classes = useStyles()
  const [state, dispatch] = useReducer(dataPointsReducer, { rows: [], prevRows: [] })
  const isLoadingState = state.rows.length === 0
  const global = useGlobal()
  const newestFirst = global.state.dataPointsNewestFirst

  useEffect(() => {
    dispatch({ type: 'setInitialState', payload: buildState(dataPoints) })
  }, [valueVariables, categoricalVariables])

  useEffect(() => {
    updateDataPoints(state.rows.filter(item => !item.isNew) as TableDataRow[])
  }, [state.rows])

  const buildState = (dataPoints: DataPointType[][]): DataPointsState => {
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

  const buildCombinedVariables = (): CombinedVariableType[] => {
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

  const toggleEditMode = (rowIndex: number) => {
    dispatch({ type: 'DATA_POINTS_TABLE_EDIT_TOGGLED', payload: rowIndex })
  }

  const cancelEdit = (rowIndex: number) => {
    dispatch({ type: 'DATA_POINTS_TABLE_EDIT_CANCELLED', payload: rowIndex })
  }

  const edit = (rowIndex: number, editValue: string, itemIndex: number) => {
    dispatch({
      type: 'DATA_POINTS_TABLE_EDITED', payload: {
        itemIndex,
        rowIndex,
        useArrayForValue: SCORE,
        value: editValue
      }
    })
  }

  const deleteRow = (rowIndex: number) => {
    dispatch({ type: 'DATA_POINTS_TABLE_ROW_DELETED', payload: rowIndex })
  }

  const addRow = (emptyRow: TableDataRow) => {
    dispatch({ type: 'DATA_POINTS_TABLE_ROW_ADDED', payload: emptyRow })
  }

  const updateDataPoints = (dataRows: TableDataRow[]) => {
    onUpdateDataPoints(dataRows
      .map(item => {
        return item.dataPoints.map(item => {
          return {
            name: item.name,
            value: item.value,
          } as DataPointType
        })
      })
    )
  }

  const onEditConfirm = (row: TableDataRow, rowIndex: number) => {
    if (row.isNew) {
      addRow(buildEmptyRow())
    } else {
      updateRow(rowIndex, toggleEditMode)
    }
  }

  const updateRow = (index: number, updateFn: UpdateFnType, ...args: any[]) => {
    const rowIndex = newestFirst ? state.rows.length - 1 - index : index
    updateFn(rowIndex, ...args)
  }

  const updateTable = (dataPoints: DataPointType[][]) => {
    dispatch({ type: 'setInitialState', payload: buildState(dataPoints) })
  }

  return (
    <TitleCard title={
      <>
      <Box display="flex" justifyContent="space-between">
        <Box>
          Data points
        </Box>
        <Box>
          <DownloadCSVButton light/>
          <UploadCSVButton light onUpload={(dataPoints: DataPointType[][]) => updateTable(dataPoints)} />
          <Tooltip title="Reverse order">
            <IconButton
              size="small"
              className={classes.titleButton}
              onClick={() => global.dispatch({ type: 'setDataPointsNewestFirst', payload: !global.state.dataPointsNewestFirst })}>
              <SwapVertIcon fontSize="small" className={classes.titleIcon} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      </>
    }>
      {buildCombinedVariables().length === 0 && "Data points will appear here"}
      {buildCombinedVariables().length > 0 && isLoadingState &&
        <CircularProgress size={24} />
      }
      {buildCombinedVariables().length > 0 && !isLoadingState &&
        <Box className={classes.tableContainer}>
          <EditableTable
            rows={(newestFirst ? [...state.rows].reverse() : state.rows) as TableDataRow[]}
            useArrayForValue={SCORE}
            onEdit={(editValue: string, rowIndex: number, itemIndex: number) => updateRow(rowIndex, edit, editValue, itemIndex)}
            onEditConfirm={(row: TableDataRow, rowIndex: number) => onEditConfirm(row, rowIndex)}
            onEditCancel={(rowIndex: number) => updateRow(rowIndex, cancelEdit)}
            onToggleEditMode={(rowIndex: number) => updateRow(rowIndex, toggleEditMode)}
            onDelete={(rowIndex: number) => updateRow(rowIndex, deleteRow)} />
        </Box>
      }
    </TitleCard>
  )
}