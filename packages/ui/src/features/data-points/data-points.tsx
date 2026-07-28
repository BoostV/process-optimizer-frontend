import { CircularProgress, IconButton, Box, Tooltip } from '@mui/material'

import { EditableTable } from '../core'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
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
  isValidScoreName,
  useExperiment,
} from '@boostv/process-optimizer-frontend-core'
import { useDataPoints } from './useDataPoints'
import { DataPointsSettings } from '@ui/features/data-points/settings/data-points-settings'
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
  csvSeparator?: string
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
    csvSeparator = ';',
  } = props
  const { classes } = useStyles()
  const { dispatch } = useExperiment()
  const [isSettingsOpen, setSettingsOpen] = useState(false)

  const enabledValueVariables = valueVariables.filter(v => v.enabled)
  const enabledCategoricalVariables = categoricalVariables.filter(
    v => v.enabled
  )
  const { state, addRow, deleteRows, editRow, setEnabledState, setNote } =
    useDataPoints(
      enabledValueVariables,
      enabledCategoricalVariables,
      scoreVariables,
      dataPoints
    )

  const isLoadingState = state.rows.length === 0

  // The metaId of a freshly added row is assigned inside `addRow` (max id + 1,
  // pushed to the end of the returned entries), so read it back from there.
  const dispatchResponses = (row: TableDataRow, metaId: number) =>
    row.scoreFunctions?.forEach(sf => {
      if (!sf.hasFunction || !isValidScoreName(sf.scoreName)) {
        return
      }
      dispatch({
        type: 'updateDataPointResponses',
        payload: {
          metaId,
          scoreName: sf.scoreName,
          useFunction: sf.useFunction,
          values: sf.responseVars
            .filter(rv => (sf.values[rv.symbol] ?? '').trim() !== '')
            .map(rv => ({
              symbol: rv.symbol,
              // match factor inputs: accept a comma decimal separator
              value: Number((sf.values[rv.symbol] ?? '').replaceAll(',', '.')),
            }))
            .filter(v => Number.isFinite(v.value)),
        },
      })
    })

  const rowAdded = (row: TableDataRow) => {
    const updated = addRow({
      ...row,
      dataPoints: row.dataPoints.filter(dp => dp.value !== undefined),
    })
    onUpdateDataPoints(updated)
    const newId = updated[updated.length - 1]?.meta.id
    if (newId !== undefined) {
      dispatchResponses(row, newId)
    }
  }

  const rowsDeleted = (rowIndices: number[]) =>
    onUpdateDataPoints(deleteRows(rowIndices))

  const rowEnabledToggled = (rowIndex: number, enabled: boolean) =>
    onUpdateDataPoints(setEnabledState(rowIndex, enabled))

  const rowNoteChanged = (rowIndex: number, note: string | undefined) =>
    onUpdateDataPoints(setNote(rowIndex, note))

  const rowEdited = (rowIndex: number, row: TableDataRow) => {
    onUpdateDataPoints(editRow(rowIndex, row))
    if (row.metaId !== undefined) {
      dispatchResponses(row, row.metaId)
    }
  }

  return (
    <TitleCard
      id={id}
      warning={warning}
      title={
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            Data points
            <Box>
              <DownloadCSVButton
                light
                onClick={() =>
                  saveCSVToLocalFile(
                    dataPointsToCSV(dataPoints, csvSeparator),
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
                separator={csvSeparator}
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
              <Tooltip disableInteractive title="Score functions">
                <span>
                  <IconButton
                    size="small"
                    className={classes.iconLight}
                    disabled={
                      enabledValueVariables.length +
                        enabledCategoricalVariables.length ===
                        0 || isLoadingState
                    }
                    onClick={() => setSettingsOpen(!isSettingsOpen)}
                  >
                    {isSettingsOpen ? (
                      <StarBorderIcon fontSize="small" />
                    ) : (
                      <StarIcon fontSize="small" />
                    )}
                  </IconButton>
                </span>
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
                onCancel={() => setSettingsOpen(false)}
                onSave={() => setSettingsOpen(false)}
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
                onRowNoteChanged={(index, note) => rowNoteChanged(index, note)}
              />
            </Box>
          </>
        )}
    </TitleCard>
  )
}
