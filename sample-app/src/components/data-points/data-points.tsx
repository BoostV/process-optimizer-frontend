import { CircularProgress, IconButton, Box, Tooltip } from '@mui/material'
import { useEffect, useMemo, useReducer } from 'react'
import { useGlobal } from '@/context/global'
import { EditableTable } from '@/components/editable-table/editable-table'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import { TitleCard } from '@process-optimizer-frontend/core/src/features/core/title-card/title-card'
import useStyles from './data-points.style'
import DownloadCSVButton from '@/components/download-csv-button'
import UploadCSVButton from '@/components/upload-csv-button'
import { dataPointsReducer } from './data-points-reducer'
import { TableDataRow } from '@/components/editable-table'
import {
  CategoricalVariableType,
  DataEntry,
  DataPointTypeValue,
  ScoreVariableType,
  ValueVariableType,
} from '@process-optimizer-frontend/core/src/common/types/common'

type DataPointProps = {
  valueVariables: ValueVariableType[]
  categoricalVariables: CategoricalVariableType[]
  scoreVariables: ScoreVariableType[]
  dataPoints: DataEntry[]
  onUpdateDataPoints: (dataPoints: DataEntry[]) => void
}

export default function DataPoints(props: DataPointProps) {
  const {
    valueVariables,
    categoricalVariables,
    scoreVariables,
    dataPoints,
    onUpdateDataPoints,
  } = props
  const { classes } = useStyles()
  const [state, dispatch] = useReducer(dataPointsReducer, {
    meta: [],
    rows: [],
    changed: false,
  })
  const isLoadingState = state.rows.length === 0
  const global = useGlobal()
  const newestFirst = global.state.dataPointsNewestFirst

  const scoreNames = useMemo(
    () => scoreVariables.filter(it => it.enabled).map(it => it.name),
    [scoreVariables]
  )

  const rowAdded = (row: TableDataRow) =>
    dispatch({
      type: 'rowAdded',
      payload: row,
    })

  const rowDeleted = (rowIndex: number) =>
    dispatch({
      type: 'rowDeleted',
      payload: rowIndex,
    })

  const rowEdited = (rowIndex: number, row: TableDataRow) =>
    dispatch({
      type: 'rowEdited',
      payload: {
        rowIndex,
        row,
      },
    })

  useEffect(() => {
    dispatch({
      type: 'setInitialState',
      payload: {
        valueVariables,
        categoricalVariables,
        scoreNames,
        data: dataPoints,
      },
    })
  }, [valueVariables, categoricalVariables, scoreNames, dataPoints])

  useEffect(() => {
    const convertEditableRowToExperimentRow = (
      row: TableDataRow | undefined
    ) => {
      if (row === undefined) {
        return []
      }
      const vars = row.dataPoints.filter(dp => !scoreNames.includes(dp.name))
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
        .concat(scores) as DataEntry['data']
    }
    const updateDataPoints = (
      meta: DataEntry['meta'][],
      rows: TableDataRow[]
    ) => {
      const zipped = meta.map((m, idx) => [
        m,
        convertEditableRowToExperimentRow(rows.filter(e => !e.isNew)[idx]),
      ])
      onUpdateDataPoints(
        zipped.map(e => ({ meta: e[0], data: e[1] })) as DataEntry[]
      )
    }
    if (state.changed) {
      updateDataPoints(state.meta, state.rows)
    }
  }, [onUpdateDataPoints, scoreNames, state.changed, state.rows, state.meta])

  return (
    <TitleCard
      title={
        <>
          <Box display="flex" justifyContent="space-between">
            Data points
            <Box>
              <DownloadCSVButton light />
              <UploadCSVButton
                light
                onUpload={(dataPoints: DataEntry[]) =>
                  onUpdateDataPoints(dataPoints)
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
      {valueVariables.length + categoricalVariables.length === 0 &&
        'Data points will appear here'}
      {valueVariables.length + categoricalVariables.length > 0 &&
        isLoadingState && <CircularProgress size={24} />}
      {valueVariables.length + categoricalVariables.length > 0 &&
        !isLoadingState && (
          <Box className={classes.tableContainer}>
            <EditableTable
              newestFirst={global.state.dataPointsNewestFirst}
              rows={
                (newestFirst
                  ? [...state.rows].reverse()
                  : [...state.rows]) as TableDataRow[]
              }
              onRowAdded={(row: TableDataRow) => rowAdded(row)}
              onRowDeleted={(rowIndex: number) => rowDeleted(rowIndex)}
              onRowEdited={(rowIndex: number, row: TableDataRow) =>
                rowEdited(rowIndex, row)
              }
            />
          </Box>
        )}
    </TitleCard>
  )
}
