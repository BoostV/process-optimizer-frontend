import { CircularProgress, IconButton, Box, Tooltip } from '@material-ui/core'
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { useGlobal } from '../../context/global-context'
import {
  dataPointsReducer,
  DataPointsState,
} from '../../reducers/data-points-reducer'
import {
  DataPointType,
  TableDataPoint,
  TableDataRow,
  CombinedVariableType,
  ValueVariableType,
  CategoricalVariableType,
  DataPointTypeValue,
  ScoreVariableType,
} from '../../types/common'
import { EditableTable } from '../editable-table/editable-table'
import SwapVertIcon from '@material-ui/icons/SwapVert'
import { TitleCard } from '../title-card/title-card'
import useStyles from './data-points.style'
import DownloadCSVButton from '../download-csv-button'
import UploadCSVButton from '../upload-csv-button'

type DataPointProps = {
  valueVariables: ValueVariableType[]
  categoricalVariables: CategoricalVariableType[]
  scoreVariables: ScoreVariableType[]
  dataPoints: DataPointType[][]
  onUpdateDataPoints: (dataPoints: DataPointType[][]) => void
}

type UpdateFnType = (rowIndex: number, ...args: any[]) => void

export default function DataPoints(props: DataPointProps) {
  const {
    valueVariables,
    categoricalVariables,
    scoreVariables,
    dataPoints,
    onUpdateDataPoints,
  } = props
  const classes = useStyles()
  const [state, dispatch] = useReducer(dataPointsReducer, {
    rows: [],
    prevRows: [],
    changed: false,
    hasTempChange: false,
  })
  const isLoadingState = state.rows.length === 0
  const global = useGlobal()
  const newestFirst = global.state.dataPointsNewestFirst

  const scoreNames = useMemo(
    () => scoreVariables.filter(it => it.enabled).map(it => it.name),
    [scoreVariables]
  )

  const buildCombinedVariables = useCallback((): CombinedVariableType[] => {
    return (valueVariables as CombinedVariableType[]).concat(
      categoricalVariables as CombinedVariableType[]
    )
  }, [categoricalVariables, valueVariables])

  const buildEmptyRow = useCallback((): TableDataRow => {
    return {
      dataPoints: buildCombinedVariables()
        .map((variable, i) => {
          return {
            name: variable.name,
            value: variable.options ? variable.options[0] : '',
            options: variable.options,
          }
        })
        .concat(
          scoreNames.map(s => ({
            name: s,
            value: '0',
            options: undefined,
          }))
        ),
      isEditMode: true,
      isNew: true,
    }
  }, [buildCombinedVariables, scoreNames])

  const toggleEditMode = (rowIndex: number) => {
    dispatch({ type: 'DATA_POINTS_TABLE_EDIT_TOGGLED', payload: rowIndex })
  }

  const cancelEdit = (rowIndex: number) => {
    dispatch({ type: 'DATA_POINTS_TABLE_EDIT_CANCELLED', payload: rowIndex })
  }

  const edit = (rowIndex: number, editValue: string, itemIndex: number) => {
    dispatch({
      type: 'DATA_POINTS_TABLE_EDITED',
      payload: {
        itemIndex,
        rowIndex,
        value: editValue,
      },
    })
  }

  const deleteRow = (rowIndex: number) => {
    dispatch({ type: 'DATA_POINTS_TABLE_ROW_DELETED', payload: rowIndex })
  }

  const addRow = (emptyRow: TableDataRow) => {
    dispatch({ type: 'DATA_POINTS_TABLE_ROW_ADDED', payload: emptyRow })
  }

  const buildState = useCallback(
    (dataPoints: DataPointType[][]): DataPointsState => {
      const combinedVariables: CombinedVariableType[] = buildCombinedVariables()
      const emptyRow: TableDataRow = buildEmptyRow()
      const dataPointRows: TableDataRow[] = dataPoints
        .map(item => {
          const rowData: DataPointType[] = item.filter(
            dp => !scoreNames.includes(dp.name)
          )
          const vars: TableDataPoint[] = new Array(rowData.length)
          rowData.forEach(v => {
            const idx = combinedVariables.findIndex(it => it.name === v.name)
            vars[idx] = {
              name: v.name,
              value: v.value.toString(),
              options: combinedVariables[idx]?.options,
            }
          })
          const scores: TableDataPoint[] = item
            .filter(dp => scoreNames.includes(dp.name))
            .map(score => ({ name: score.name, value: score.value as string }))
          return {
            dataPoints: vars.concat(scores),
            isEditMode: false,
            isNew: false,
          }
        })
        .concat(emptyRow as any)

      return {
        rows: dataPointRows,
        prevRows: dataPointRows,
        changed: false,
        hasTempChange: false,
      }
    },
    [buildCombinedVariables, buildEmptyRow, scoreNames]
  )

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

  useEffect(() => {
    dispatch({ type: 'setInitialState', payload: buildState(dataPoints) })
  }, [valueVariables, categoricalVariables, scoreNames, buildState, dataPoints])

  useEffect(() => {
    const updateDataPoints = (dataRows: TableDataRow[]) => {
      onUpdateDataPoints(
        dataRows.map(row => {
          const vars = row.dataPoints.filter(
            dp => !scoreNames.includes(dp.name)
          )
          const scores = row.dataPoints
            .filter(dp => scoreNames.includes(dp.name))
            .map(s => ({
              name: s.name,
              value: parseFloat(s.value),
            }))
          return vars
            .map(dp => ({
              name: dp.name,
              value: dp.value as DataPointTypeValue,
            }))
            .concat(scores)
        })
      )
    }
    if (state.changed) {
      updateDataPoints(state.rows.filter(item => !item.isNew) as TableDataRow[])
    }
  }, [onUpdateDataPoints, scoreNames, state.changed, state.rows])

  return (
    <TitleCard
      title={
        <>
          <Box display="flex" justifyContent="space-between">
            <Box>
              Data points
              <br />
            </Box>
            <Box>
              <DownloadCSVButton light />
              <UploadCSVButton
                light
                onUpload={(dataPoints: DataPointType[][]) =>
                  updateTable(dataPoints)
                }
              />
              <Tooltip title="Reverse order">
                <IconButton
                  size="small"
                  className={classes.titleButton}
                  onClick={() =>
                    global.dispatch({
                      type: 'setDataPointsNewestFirst',
                      payload: !global.state.dataPointsNewestFirst,
                    })
                  }
                >
                  <SwapVertIcon
                    fontSize="small"
                    className={classes.titleIcon}
                  />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </>
      }
    >
      {buildCombinedVariables().length === 0 && 'Data points will appear here'}
      {buildCombinedVariables().length > 0 && isLoadingState && (
        <CircularProgress size={24} />
      )}
      {buildCombinedVariables().length > 0 && !isLoadingState && (
        <Box className={classes.tableContainer}>
          <EditableTable
            rows={
              (newestFirst
                ? [...state.rows].reverse()
                : state.rows) as TableDataRow[]
            }
            onEdit={(editValue: string, rowIndex: number, itemIndex: number) =>
              updateRow(rowIndex, edit, editValue, itemIndex)
            }
            onEditConfirm={(row: TableDataRow, rowIndex: number) =>
              onEditConfirm(row, rowIndex)
            }
            onEditCancel={(rowIndex: number) => updateRow(rowIndex, cancelEdit)}
            onToggleEditMode={(rowIndex: number) =>
              updateRow(rowIndex, toggleEditMode)
            }
            onDelete={(rowIndex: number) => updateRow(rowIndex, deleteRow)}
          />
        </Box>
      )}
    </TitleCard>
  )
}
