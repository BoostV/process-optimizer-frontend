import { CircularProgress, IconButton, Box, Tooltip } from '@material-ui/core'
import { useEffect } from 'react'
import { useGlobal } from '../../context/global-context'
import {
  DataPointType,
  TableDataRow,
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
import { useDataTable } from './useDataTable'

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
  const {
    headerDefinitions,
    emptyRow,
    rows,
    changed,
    scoreNames,
    toggleEditMode,
    edit,
    cancelEdit,
    addRow,
    deleteRow,
  } = useDataTable({
    valueVariables,
    categoricalVariables,
    scoreVariables,
    dataPoints,
  })

  const isLoadingState = rows.length === 0
  const {
    state: { dataPointsNewestFirst: newestFirst },
  } = useGlobal()

  const onEditConfirm = (row: TableDataRow, rowIndex: number) => {
    if (row.isNew) {
      addRow(emptyRow)
    } else {
      updateRow(rowIndex, toggleEditMode)
    }
  }

  const updateRow = (index: number, updateFn: UpdateFnType, ...args: any[]) => {
    const rowIndex = newestFirst ? rows.length - 1 - index : index
    updateFn(rowIndex, ...args)
  }

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
    if (changed) {
      updateDataPoints(rows.filter(item => !item.isNew) as TableDataRow[])
    }
  }, [onUpdateDataPoints, scoreNames, changed, rows])

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
      {headerDefinitions.length === 0 && 'Data points will appear here'}
      {headerDefinitions.length > 0 && isLoadingState && (
        <CircularProgress size={24} />
      )}
      {headerDefinitions.length > 0 && !isLoadingState && (
        <Box className={classes.tableContainer}>
          <EditableTable
            rows={(newestFirst ? [...rows].reverse() : rows) as TableDataRow[]}
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
