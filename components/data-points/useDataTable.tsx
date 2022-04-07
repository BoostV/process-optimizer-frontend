import { useReducer, useMemo, useCallback, useEffect } from 'react'
import {
  CombinedVariableType,
  TableDataRow,
  DataPointType,
  TableDataPoint,
} from '../../types/common'
import { dataPointsReducer, DataPointsState } from './data-points-reducer'

export const useDataTable = ({
  valueVariables,
  categoricalVariables,
  scoreVariables,
  dataPoints,
}) => {
  const [state, dispatch] = useReducer(dataPointsReducer, {
    rows: [],
    prevRows: [],
    changed: false,
    hasTempChange: false,
  })

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

  useEffect(() => {
    dispatch({ type: 'setInitialState', payload: buildState(dataPoints) })
  }, [valueVariables, categoricalVariables, scoreNames, buildState, dataPoints])

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

  const headerDefinitions = buildCombinedVariables()

  return {
    headerDefinitions,
    emptyRow: buildEmptyRow(),
    rows: state.rows,
    changed: state.changed,
    scoreNames,
    addRow,
    cancelEdit,
    edit,
    deleteRow,
    toggleEditMode,
  }
}
