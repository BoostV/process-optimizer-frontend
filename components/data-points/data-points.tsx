import { CircularProgress, IconButton, Box, Tooltip } from '@material-ui/core'
import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { useGlobal } from '../../context/global-context'
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
import { useExperiment } from '../../context/experiment-context'
import {
  dataPointsReducer,
  DataPointsState,
} from '../../reducers/data-points-reducer'

type DataPointProps = {
  valueVariables: ValueVariableType[]
  categoricalVariables: CategoricalVariableType[]
  scoreVariables: ScoreVariableType[]
  dataPoints: DataPointType[][]
  onUpdateDataPoints: (dataPoints: DataPointType[][]) => void
}

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
    changed: false,
  })
  const isLoadingState = state.rows.length === 0
  const global = useGlobal()
  const newestFirst = global.state.dataPointsNewestFirst
  const {
    state: {
      experiment: { results },
    },
  } = useExperiment()

  const scoreNames = useMemo(
    () => scoreVariables.filter(it => it.enabled).map(it => it.name),
    [scoreVariables]
  )

  const buildCombinedVariables = useCallback((): CombinedVariableType[] => {
    return (
      valueVariables.map(v => ({
        ...v,
        tooltip: `[${v.min}, ${v.max}]`,
      })) as CombinedVariableType[]
    ).concat(
      categoricalVariables.map(v => ({
        ...v,
        tooltip: `${v.options.length} options`,
      })) as CombinedVariableType[]
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
            tooltip: variable.tooltip,
          }
        })
        .concat(
          scoreNames.map(s => ({
            name: s,
            value: '',
            options: undefined,
            tooltip: undefined,
          }))
        ),
      isNew: true,
    }
  }, [buildCombinedVariables, scoreNames])

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

  const buildState = useCallback(
    (dataPoints: DataPointType[][]): DataPointsState => {
      const combinedVariables: CombinedVariableType[] = buildCombinedVariables()
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
              tooltip: combinedVariables[idx]?.tooltip,
            }
          })
          const scores: TableDataPoint[] = item
            .filter(dp => scoreNames.includes(dp.name))
            .map(score => ({ name: score.name, value: score.value as string }))
          return {
            dataPoints: vars.concat(scores),
            isNew: false,
          }
        })
        .concat(buildEmptyRow())

      return {
        rows: dataPointRows,
        changed: false,
      }
    },
    [buildCombinedVariables, scoreNames, buildEmptyRow]
  )

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

  const calcIndex = (rowIndex: number) =>
    newestFirst ? state.rows.length - rowIndex - 1 : rowIndex

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
      {buildCombinedVariables().length === 0 && 'Data points will appear here'}
      {buildCombinedVariables().length > 0 && isLoadingState && (
        <CircularProgress size={24} />
      )}
      {buildCombinedVariables().length > 0 && !isLoadingState && (
        <Box className={classes.tableContainer}>
          <EditableTable
            newestFirst={!global.state.dataPointsNewestFirst}
            suggestedValues={results.next}
            rows={
              (newestFirst
                ? [...state.rows].reverse()
                : [...state.rows]) as TableDataRow[]
            }
            onRowAdded={(row: TableDataRow) => rowAdded(row)}
            onRowDeleted={(rowIndex: number) => rowDeleted(calcIndex(rowIndex))}
            onRowEdited={(rowIndex: number, row: TableDataRow) =>
              rowEdited(calcIndex(rowIndex), row)
            }
          />
        </Box>
      )}
    </TitleCard>
  )
}
