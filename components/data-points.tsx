import { CircularProgress, IconButton, Button, Grid, Input } from "@material-ui/core";
import { useEffect, useReducer } from "react";
import { useGlobal } from "../context/global-context";
import { dataPointsReducer, DataPointsState } from "../reducers/data-points-reducer";
import { DataPointType, TableDataPoint, TableDataRow, CombinedVariableType, ValueVariableType, CategoricalVariableType } from "../types/common";
import { EditableTable } from "./editable-table";
import SwapVertIcon from '@material-ui/icons/SwapVert';
import { TitleCard } from './title-card';
import useStyles from "../styles/data-points.style";
import { useExperiment } from '../context/experiment-context';



type DataPointProps = {
  valueVariables: ValueVariableType[]
  categoricalVariables: CategoricalVariableType[]
  dataPoints: DataPointType[][]
  onUpdateDataPoints: (dataPoints: DataPointType[][]) => void
}

type UpdateFnType = (rowIndex: number, ...args: any[]) => void

const SCORE = "score"

export default function DataPoints(props: DataPointProps) {
  const { valueVariables, categoricalVariables, dataPoints, onUpdateDataPoints} = props
  const classes = useStyles()
  const [state, dispatch] = useReducer(dataPointsReducer, { rows: [], prevRows: [] })
  const isLoadingState = state.rows.length === 0
  const global = useGlobal()
  const newestFirst = global.state.dataPointsNewestFirst

  useEffect(() => {
    dispatch({ type: 'setInitialState', payload: buildState()})
  }, [valueVariables, categoricalVariables])

  const buildState = (): DataPointsState => {
    const combinedVariables: CombinedVariableType[] = buildCombinedVariables()
    const emptyRow: TableDataRow = buildEmptyRow()
    const dataPointRows: TableDataRow[] = dataPoints.map((item, i) => {
        return {
          dataPoints: item.map((point: TableDataPoint, k) => {
            return {
              ...point,
              options: combinedVariables[k] ? combinedVariables[k].options : undefined,
            }
          }),
          isEditMode: false,
          isNew: false,
        }
      }
    ).concat(emptyRow as any)

    return {
      rows: dataPointRows,
      prevRows: dataPointRows,
    }
  }

  const buildCombinedVariables = (): CombinedVariableType[]  => {
    return (valueVariables as CombinedVariableType[]).concat(categoricalVariables as CombinedVariableType[])
  }

  const buildEmptyRow = (): TableDataRow => {
    return {
      dataPoints: buildCombinedVariables().map((variable, i) => {
        return {
          name: variable.name,
          value: variable.options ? variable.options[0] : "",
          options: variable.options,
        }
      }).concat({
        name: SCORE,
        value: "0",
        options: undefined,
      }),
      isEditMode: true,
      isNew: true,
    }
  }

  useEffect(() => {
    updateDataPoints(state.rows.filter(item => !item.isNew) as TableDataRow[])
  }, [state.rows])

  function toggleEditMode(rowIndex: number) {
    dispatch({ type: 'DATA_POINTS_TABLE_EDIT_TOGGLED', payload: rowIndex })
  }

  function cancelEdit(rowIndex: number) {
    dispatch({ type: 'DATA_POINTS_TABLE_EDIT_CANCELLED', payload: rowIndex })
  }

  function edit(rowIndex: number, editValue: string, itemIndex: number) {
    dispatch({ type: 'DATA_POINTS_TABLE_EDITED', payload: { 
      itemIndex,
      rowIndex,
      useArrayForValue: SCORE,
      value: editValue
    }})
  }
  
  function deleteRow(rowIndex: number) {
    dispatch({ type: 'DATA_POINTS_TABLE_ROW_DELETED', payload: rowIndex })
  }

  function addRow(emptyRow: TableDataRow) {
    dispatch({ type: 'DATA_POINTS_TABLE_ROW_ADDED', payload: emptyRow })
  }

  function updateDataPoints(dataRows: TableDataRow[]) {
    onUpdateDataPoints(dataRows
      .map((item, i) => {
        return item.dataPoints.map(item => {
          return {
            name: item.name,
            value: item.value,
          } as DataPointType
        })
      })
    )
  }

  function onEditConfirm(row: TableDataRow, rowIndex: number) {
    if (row.isNew) {
      addRow(buildEmptyRow())
    } else {
      updateRow(rowIndex, toggleEditMode)
    }
  }

  function updateRow(index: number, updateFn: UpdateFnType, ...args: any[]) {
    const rowIndex = newestFirst ? state.rows.length - 1 - index : index
    updateFn(rowIndex, ...args)
  }

  function DownloadCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    state.rows[0].dataPoints.map((item, index) => {
      if (index < state.rows[0].dataPoints.length - 1) {
        csvContent += item.name + ",";
      }
      else {
        csvContent += item.name + "\r\n";
      }
    });
    state.rows.forEach(function (rowArray, rowIndex) {
      rowArray.dataPoints.map((item, index) => {
        if (state.rows[rowIndex].dataPoints[0].value !== '') {
          if (index < rowArray.dataPoints.length - 1) {
            csvContent += item.value + ",";
          }
          else if (rowIndex < state.rows.length - 1 && state.rows[rowIndex + 1].dataPoints[0].value !== '') {
            csvContent += item.value + "\r\n";
          }
          else {
            csvContent += item.value
          }
        }
      })
    });
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", experiment.id + ".csv");
    document.body.appendChild(link);
    link.click();
  }

  function UploadCSV(e) {
    const init_data_points = state.rows[state.rows.length - 1].dataPoints[0].value == "" ? state.rows.length - 1 : state.rows.length
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
      var contents = e.target.result;
      var data = String(contents).split(/\r\n|\n/);
      if (data[0] !== String(state.rows[0].dataPoints.map((item, index) => item.name))) {
        alert("Headers of the CSV are not correct" + "\r\nExpected: " + String(state.rows[0].dataPoints.map((item, index) => item.name))
          + "\r\nBut got: " + data[0])
        return;
      }
      var dims = (data[0].match(/,/g) || []).length
      for (let i = 1; i < data.length; i++) {
        if ((data[i].match(/,/g) || []).length == dims) {
          if (i > 1 || state.rows[state.rows.length - 1].dataPoints[0].value != "") {
            addRow(buildEmptyRow())
          }
          var data_array = String(data[i]).split(',');
          for (let j = 0; j < data_array.length; j++) {
            updateRow(init_data_points - 1 + i, edit, data_array[j], j)
          }
        } else {
          alert("Wrong amount of variables in line " + i + "\r\nExpected: " + dims + "\r\nBut got: " + (data[i].match(/,/g) || []).length)
        }
      }
    };
    reader.readAsText(file)
  }

  return (
    <TitleCard title={
      <>
        <Grid container  spacing={2} justify='space-between'>
          <Grid item xs={2}>
            Data points
          </Grid>
          <Grid item xs={8} style={{textAlign: "center"}}>
            <Button
              variant="contained"
              onClick={() => DownloadCSV()}
              color="primary"
            >Download csv</Button>
            <Button
              variant="contained"
              color="primary"
              component="label"
            >
              Upload CSV
              <Input
                type="file"
                value=""
                style={{ display: 'none' }}
                inputProps={{
                  accept:
                    ".csv"
                }}
                onChange={(e) => UploadCSV(e)}
              />
            </Button>
          </Grid>
          <Grid item xs={1}></Grid>
            <IconButton
              size="small"
              className={classes.orderButton}
              onClick={() => global.dispatch({ type: 'setDataPointsNewestFirst', payload: !global.state.dataPointsNewestFirst })}>
              <SwapVertIcon fontSize="small" className={classes.orderIcon} />
            </IconButton>
          </Grid>
      </>
    }>
      {buildCombinedVariables().length === 0 && "Data points will appear here"}
      {buildCombinedVariables().length > 0 && isLoadingState &&
        <CircularProgress size={24} />
      }
      {buildCombinedVariables().length > 0 && !isLoadingState &&
        <EditableTable
          rows={(newestFirst ? [...state.rows].reverse() : state.rows) as TableDataRow[]}
          useArrayForValue={SCORE}
          onEdit={(editValue: string, rowIndex: number, itemIndex: number) => updateRow(rowIndex, edit, editValue, itemIndex)}
          onEditConfirm={(row: TableDataRow, rowIndex: number) => onEditConfirm(row, rowIndex)}
          onEditCancel={(rowIndex: number) => updateRow(rowIndex, cancelEdit)}
          onToggleEditMode={(rowIndex: number) => updateRow(rowIndex, toggleEditMode)}
          onDelete={(rowIndex: number) => updateRow(rowIndex, deleteRow)} />
      }
    </TitleCard>
  )
}