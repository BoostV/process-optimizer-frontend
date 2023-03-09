import { CircularProgress, IconButton, Box, Tooltip } from '@mui/material'
import { useEffect, useMemo, useReducer } from 'react'
import { EditableTable } from '../core'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import { InfoBox, TitleCard } from '../core/title-card/title-card'
import DownloadCSVButton from './download-csv-button'
import useStyles from './data-points.style'
import UploadCSVButton from './upload-csv-button'
import { dataPointsReducer } from './data-points-reducer'
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
  const [state, dispatch] = useReducer(dataPointsReducer, {
    meta: [],
    rows: [],
    changed: false,
  })
  const isLoadingState = state.rows.length === 0
  const isDuplicateVariableNames = useMemo(
    () =>
      violations !== undefined && violations?.duplicateVariableNames.length > 0,
    [violations?.duplicateVariableNames]
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
    [
      violations?.dataPointsUndefined,
      violations?.upperBoundary,
      violations?.lowerBoundary,
      violations?.dataPointsNotNumber,
    ]
  )

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
          value: s.value,
        }))
      return vars
        .map(dp => ({
          name: dp.name,
          value: dp.value,
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
                categoricalVariables={categoricalVariables}
                valueVariables={valueVariables}
                scoreVariables={scoreVariables}
              />
              <Tooltip title="Reverse order">
                <IconButton
                  size="small"
                  className={classes.titleButton}
                  onClick={onToggleNewestFirst}
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
      infoBoxes={getGeneralViolations()}
    >
      {valueVariables.length + categoricalVariables.length === 0 &&
        'Data points will appear here'}
      {valueVariables.length + categoricalVariables.length > 0 &&
        isLoadingState && <CircularProgress size={24} />}
      {valueVariables.length + categoricalVariables.length > 0 &&
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
            />
          </Box>
        )}
    </TitleCard>
  )
}
