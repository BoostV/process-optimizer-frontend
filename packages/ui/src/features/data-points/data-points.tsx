import { CircularProgress, IconButton, Box, Tooltip } from '@mui/material'
import { EditableTable } from '../core'
import { SwapVert } from '@mui/icons-material'
import { TitleCard } from '../core/title-card/title-card'
import DownloadCSVButton from './download-csv-button'
import useStyles from './data-points.style'
import UploadCSVButton from './upload-csv-button'
import { TableDataRow } from '../core/editable-table'
import {
  saveCSVToLocalFile,
  dataPointsToCSV,
  CategoricalVariableType,
  DataEntry,
  ScoreVariableType,
  ValueVariableType,
  EditableTableViolation,
} from '@boostv/process-optimizer-frontend-core'
import { useDataPoints } from './useDataPoints'

type DataPointProps = {
  id?: string
  experimentId: string
  valueVariables: ValueVariableType[]
  categoricalVariables: CategoricalVariableType[]
  scoreVariables: ScoreVariableType[]
  dataPoints: DataEntry[]
  newestFirst: boolean
  isEditingDisabled?: boolean
  violationsInTable?: EditableTableViolation[]
  warning?: string
  onToggleNewestFirst: () => void
  onUpdateDataPoints: (dataPoints: DataEntry[]) => void
}

export function DataPoints(props: DataPointProps) {
  const {
    id = 'data-points',
    experimentId,
    valueVariables,
    categoricalVariables,
    scoreVariables,
    dataPoints,
    newestFirst,
    isEditingDisabled,
    violationsInTable,
    warning,
    onToggleNewestFirst,
    onUpdateDataPoints,
  } = props
  const { classes } = useStyles()
  const enabledValueVariables = valueVariables.filter(v => v.enabled)
  const enabledCategoricalVariables = categoricalVariables.filter(
    v => v.enabled
  )
  const { state, addRow, deleteRow, editRow, setEnabledState } = useDataPoints(
    enabledValueVariables,
    enabledCategoricalVariables,
    scoreVariables,
    dataPoints
  )

  const isLoadingState = state.rows.length === 0

  const rowAdded = (row: TableDataRow) =>
    onUpdateDataPoints(
      addRow({
        ...row,
        dataPoints: row.dataPoints.filter(dp => dp.value !== undefined),
      })
    )

  const rowDeleted = (rowIndex: number) =>
    onUpdateDataPoints(deleteRow(rowIndex))

  const rowEnabledToggled = (rowIndex: number, enabled: boolean) =>
    onUpdateDataPoints(setEnabledState(rowIndex, enabled))

  const rowEdited = (rowIndex: number, row: TableDataRow) =>
    onUpdateDataPoints(editRow(rowIndex, row))

  return (
    <TitleCard
      id={id}
      warning={warning}
      title={
        <>
          <Box display="flex" justifyContent="space-between">
            Data points
            <Box>
              <DownloadCSVButton
                light
                onClick={() =>
                  saveCSVToLocalFile(
                    dataPointsToCSV(dataPoints),
                    experimentId + '.csv'
                  )
                }
              />
              <UploadCSVButton
                light
                onUpload={(dataPoints: DataEntry[]) =>
                  onUpdateDataPoints(dataPoints)
                }
                categoricalVariables={enabledCategoricalVariables}
                valueVariables={enabledValueVariables}
                scoreVariables={scoreVariables}
              />
              <Tooltip disableInteractive title="Reverse order">
                <IconButton
                  size="small"
                  className={classes.titleButton}
                  onClick={onToggleNewestFirst}
                >
                  <SwapVert fontSize="small" className={classes.titleIcon} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </>
      }
    >
      {enabledValueVariables.length + enabledCategoricalVariables.length ===
        0 && 'Data points will appear here'}
      {enabledValueVariables.length + enabledCategoricalVariables.length > 0 &&
        isLoadingState && <CircularProgress size={24} />}
      {enabledValueVariables.length + enabledCategoricalVariables.length > 0 &&
        !isLoadingState && (
          <Box className={classes.tableContainer}>
            <EditableTable
              newestFirst={newestFirst}
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
              violations={violationsInTable}
              order={newestFirst ? 'ascending' : 'descending'}
              isEditingDisabled={isEditingDisabled}
              onRowEnabledToggled={(index, enabled) =>
                rowEnabledToggled(index, enabled)
              }
            />
          </Box>
        )}
    </TitleCard>
  )
}
