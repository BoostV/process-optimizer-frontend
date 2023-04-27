import { CircularProgress, IconButton, Box, Tooltip } from '@mui/material'
import { useMemo } from 'react'
import { EditableTable } from '../core'
import { SwapVert } from '@mui/icons-material'
import { InfoBox, TitleCard } from '../core/title-card/title-card'
import DownloadCSVButton from './download-csv-button'
import useStyles from './data-points.style'
import UploadCSVButton from './upload-csv-button'
import { EditableTableViolation, TableDataRow } from '../core/editable-table'
import {
  saveCSVToLocalFile,
  dataPointsToCSV,
  CategoricalVariableType,
  DataEntry,
  ScoreVariableType,
  ValueVariableType,
  ValidationViolations,
} from '@boostv/process-optimizer-frontend-core'
import { findDataPointViolations } from './util'
import { useDatapoints } from './useDatapoints'

type DataPointProps = {
  experimentId: string
  valueVariables: ValueVariableType[]
  categoricalVariables: CategoricalVariableType[]
  scoreVariables: ScoreVariableType[]
  dataPoints: DataEntry[]
  newestFirst: boolean
  onToggleNewestFirst: () => void
  onUpdateDataPoints: (dataPoints: DataEntry[]) => void
  violations?: ValidationViolations
}

export function DataPoints(props: DataPointProps) {
  const {
    experimentId,
    valueVariables,
    categoricalVariables,
    scoreVariables,
    dataPoints,
    newestFirst,
    onToggleNewestFirst,
    onUpdateDataPoints,
    violations,
  } = props
  const { classes } = useStyles()
  const enabledValueVariables = valueVariables.filter(v => v.enabled)
  const enabledCategoricalVariables = categoricalVariables.filter(
    v => v.enabled
  )
  const { state, addRow, deleteRow, editRow, setEnabledState } = useDatapoints(
    enabledValueVariables,
    enabledCategoricalVariables,
    scoreVariables,
    dataPoints
  )

  const isLoadingState = state.rows.length === 0
  const isDuplicateVariableNames = useMemo(
    () =>
      violations !== undefined && violations?.duplicateVariableNames.length > 0,
    [violations]
  )

  const getGeneralViolations = (): InfoBox[] => {
    const infoBoxes: InfoBox[] = []
    if (violations !== undefined) {
      if (isDuplicateVariableNames) {
        infoBoxes.push({
          text: `All data points disabled because of duplicate variable names: ${violations.duplicateVariableNames.join(
            ', '
          )}.`,
          type: 'error',
        })
      }
      if (violations?.duplicateDataPointIds.length > 0) {
        infoBoxes.push({
          text: `Data points with duplicate meta-ids have been disabled: ${violations.duplicateDataPointIds.join(
            ', '
          )}.`,
          type: 'warning',
        })
      }
    }
    return infoBoxes
  }

  const violationsInTable: EditableTableViolation[] | undefined = useMemo(
    () => findDataPointViolations(violations),
    [violations]
  )

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

  const rowEdited = (rowIndex: number, row: TableDataRow) => {
    console.log('rowdp', row)
    onUpdateDataPoints(editRow(rowIndex, row))
  }

  return (
    <TitleCard
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
      infoBoxes={getGeneralViolations()}
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
              isEditingDisabled={isDuplicateVariableNames}
              onRowEnabledToggled={(index, enabled) =>
                rowEnabledToggled(index, enabled)
              }
            />
          </Box>
        )}
    </TitleCard>
  )
}
