import { CircularProgress, IconButton, Box, Tooltip } from '@mui/material'

import { EditableTable } from '../core'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import SettingsIcon from '@mui/icons-material/Settings'
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
import { DataPointsSettings } from './settings/data-points-settings'
import { useState } from 'react'

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
  const [isSettingsOpen, setSettingsOpen] = useState(false)

  const enabledValueVariables = valueVariables.filter(v => v.enabled)
  const enabledCategoricalVariables = categoricalVariables.filter(
    v => v.enabled
  )
  const { state, addRow, deleteRows, editRow, setEnabledState } = useDataPoints(
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

  const rowsDeleted = (rowIndices: number[]) =>
    onUpdateDataPoints(deleteRows(rowIndices))

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
                  className={classes.iconLight}
                  onClick={onToggleNewestFirst}
                >
                  <SwapVertIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip disableInteractive title="Settings">
                <IconButton
                  size="small"
                  className={classes.iconLight}
                  onClick={() => setSettingsOpen(!isSettingsOpen)}
                >
                  {isSettingsOpen ? (
                    <SettingsOutlinedIcon fontSize="small" />
                  ) : (
                    <SettingsIcon fontSize="small" />
                  )}
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
          <>
            {isSettingsOpen && (
              <DataPointsSettings
                tabs={['Quality (0-5)', 'Quality 2 (0-5)']}
                onCancel={() => setSettingsOpen(false)}
              />
            )}
            <Box className={classes.tableContainer}>
              <EditableTable
                newestFirst={newestFirst}
                rows={
                  (newestFirst
                    ? [...state.rows].reverse()
                    : [...state.rows]) as TableDataRow[]
                }
                onRowAdded={(row: TableDataRow) => rowAdded(row)}
                onRowsDeleted={(rowIndices: number[]) =>
                  rowsDeleted(rowIndices)
                }
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
          </>
        )}
    </TitleCard>
  )
}
