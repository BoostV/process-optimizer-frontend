import { Button, Card, CardContent, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@material-ui/core";
import { useState } from "react";
import { ExperimentType, DataPointType, VariableType, DataPointTypeValue } from "../types/common";
import EditIcon from "@material-ui/icons/Edit";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from "@material-ui/icons/Cancel";
import { EditableTableCell } from "./editable-table-cell";

type DataPointProps = {
  experiment: ExperimentType
  onUpdateDataPoints: (dataPoints: DataPointType[][]) => void
  onAddDataPoints: (dataPoints: DataPointType[]) => void
}

type DataPointEditableRow = {
  dataPointEditables: DataPointEditable[]
  isEditMode: Boolean
}

type DataPointEditable = {
  dataPoint: DataPointType
  variable: VariableType
}

const SCORE = "score"

export default function DataPoints(props: DataPointProps) {
  const { experiment: { valueVariables, categoricalVariables, dataPoints }, onUpdateDataPoints, onAddDataPoints } = props
  
  const combinedVariables: VariableType[] = valueVariables.map(item => item as VariableType).concat(categoricalVariables.map(item => item as VariableType))

  const dataPointEditableRows: DataPointEditableRow[] = dataPoints.map(item => {
      return {
        dataPointEditables: item.map((item, index) => {
          return {
            dataPoint: item,
            variable: combinedVariables[index],
          }
        }),
        isEditMode: false,
      }
    }
  )

  const [rows, setRows] = useState<DataPointEditableRow[]>(dataPointEditableRows)

  /*const variableNames: string[] = valueVariables.map(item => item.name)
    .concat(categoricalVariables.map(item => item.name))
    .concat(SCORE)*/

  //const [newDataPoints, setNewDataPoints] = useState<DataPointEditable[]>(createInitialNewPoints())

  /*function createInitialNewPoints(): DataPointEditable[] {
    return dataPointEditableRows.map(name => {
      return {
        dataPoint: {
          name: "",
          value: ""
        },
        variable: undefined,
        isEditMode: false,
      }
    })
  }*/

  function onAdd() {
    //onAddDataPoints(newDataPoints)
  }

  function onNewPointChange(name: string, pointIndex: number, value: string) {
    /*const newPoints = newDataPoints.map((point, index) => {
      if (index !== pointIndex) {
        return point
      } else {
        const newValue: any = point.name === SCORE ? [parseFloat(value)] as number[]: value as string
        return {
          name,
          value: newValue
        }
      }
    })
    setNewDataPoints(newPoints)*/
  }

  function onToggleEditMode(rowIndex: number) {
    setRows(
      rows.map((row, index) => {
        if (index !== rowIndex) {
          return row
        } else {
          return {
            ...row,
            isEditMode: !row.isEditMode    
          }
        }
      })
    )
  }

  function onEdit(editValue: string, rowIndex: number, itemIndex: number) {
    console.log('edit', editValue)
    setRows(
      rows.map((row, i) => {
        if (i !== rowIndex) {
          return row
        } else {
          return {
            ...row,
            dataPointEditables: row.dataPointEditables.map((point, k) => {
              if (k !== itemIndex) {
                return point
              } else {
                return {
                  ...point,
                  dataPoint: {
                    ...point.dataPoint,
                    value: (point.dataPoint.name === SCORE ? [editValue] : editValue) as DataPointTypeValue
                  }
                }
              }
            })
          }
        }
      })
    )
  }

  function onEditConfirm(rowIndex: number) {
    onUpdateDataPoints(rows
      .map(row => row.dataPointEditables
        .map(point => { 
          return { 
            name: point.dataPoint.name, 
            value: (point.dataPoint.name === SCORE ? [point.dataPoint.value] : point.dataPoint.value) as DataPointTypeValue
          }
        })
      )
    )
    onToggleEditMode(rowIndex)
  }

  function onEditCancel(rowIndex: number) {
    //setRows(dataPointEditableRows)
    onToggleEditMode(rowIndex)
  }

  function onUpdate() {

  }

  return (
    <Card>
      <CardContent>
      
        <Typography variant="h6" gutterBottom>
          Data points
        </Typography>
          
        <Table size="small">
          <TableHead>
            <TableRow>
              {rows[0].dataPointEditables.map((item, index) => 
                <TableCell key={index}>{item.dataPoint.name}</TableCell>
              )}
              <TableCell />
            </TableRow>
          </TableHead>
          
          <TableBody>
            {rows.map((row, rowIndex) => 
              <TableRow key={rowIndex}>
                {row.dataPointEditables.map((item, itemIndex) => 
                <>
                  {/*{item.dataPoint.name === SCORE ? item.dataPoint.value[0] : item.dataPoint.value}
                    <TextField 
                      value={point.name === SCORE ? point.value[0] : point.value}
                      onChange={(e: ChangeEvent) => onDataPointEdit(point, (e.target as HTMLInputElement).value)}
                    />*/}
                    
                    <EditableTableCell
                      value={item.dataPoint.name === SCORE ? item.dataPoint.value[0] : item.dataPoint.value}
                      isEditMode={row.isEditMode}
                      onChange={(value: string) => onEdit(value, rowIndex, itemIndex) }/>
                  </>  
                )}
                <TableCell>
                  {row.isEditMode ?
                    <>
                      <IconButton
                        size="small"
                        aria-label="edit"
                        onClick={() => onEditConfirm(rowIndex)}>
                        <CheckCircleIcon color="primary" />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label="edit"
                        onClick={() => onEditCancel(rowIndex)}>
                        <CancelIcon color="primary" />
                      </IconButton>
                    </> :
                    <IconButton
                      size="small"
                      aria-label="edit"
                      onClick={() => onToggleEditMode(rowIndex)}>
                      <EditIcon color="primary" />
                    </IconButton>
                  } 
                </TableCell>
              </TableRow>
            )}
            {/*<TableRow>
              {variableNames.map((name, index) => 
                <TableCell key={index}>
                  <TextField fullWidth onChange={(e: ChangeEvent) => onNewPointChange(name, index, (e.target as HTMLInputElement).value)} />
                </TableCell>
              )}
              </TableRow>*/}

          </TableBody>
        </Table>
        <br/>
        <Button variant="outlined" onClick={() => onAdd()}>Add</Button>
        
      </CardContent>
    </Card>
  )
}