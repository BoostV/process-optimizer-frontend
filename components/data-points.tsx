import { Card, CardContent, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@material-ui/core";
import { useState } from "react";
import { ExperimentType, VariableType, DataPointTypeValue, DataPointType } from "../types/common";
import EditIcon from "@material-ui/icons/Edit";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from "@material-ui/icons/Cancel";
import { EditableTableCell } from "./editable-table-cell";

type DataPointProps = {
  experiment: ExperimentType
  onUpdateDataPoints: (dataPoints: DataPointType[][]) => void
  onAddDataPoints: (dataPoints: DataPointType[]) => void
}

type DataPointRow = {
  dataPoints: DataPointType[]
  isEditMode: boolean
  isNew: boolean
}

const SCORE = "score"

export default function DataPoints(props: DataPointProps) {
  const { experiment: { valueVariables, categoricalVariables, dataPoints }, onUpdateDataPoints, onAddDataPoints } = props
  const combinedVariables: VariableType[] = valueVariables.map(item => item as VariableType).concat(categoricalVariables.map(item => item as VariableType))
  
  const newRow: DataPointRow = {
    dataPoints: combinedVariables.map((variable, i) => {
      return {
        name: variable.name,
        value: ""
      }
    }).concat({
      name: SCORE,
      value: "0",
    }),
    isEditMode: true,
    isNew: true,
  }
  
  const dataPointEditableRows: DataPointRow[] = dataPoints.map(item => {
      return {
        dataPoints: item,
        isEditMode: false,
        isNew: false,
      }
    }
  ).concat(newRow)

  const [rows, setRows] = useState<DataPointRow[]>(dataPointEditableRows)

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
    setRows(
      rows.map((row, i) => {
        if (i !== rowIndex) {
          return row
        } else {
          return {
            ...row,
            dataPoints: row.dataPoints.map((point, k) => {
              if (k !== itemIndex) {
                return point
              } else {
                return {
                  ...point,
                  value: (point.name === SCORE ? [editValue] : editValue) as DataPointTypeValue
                }
              }
            })
          }
        }
      })
    )
  }

  function onEditConfirm(row: DataPointRow, rowIndex: number) {
    onUpdateDataPoints(rows
      .filter(item => row.isNew || !item.isNew)
      .map((item, i) => {
        return item.dataPoints
      })
    )

    if (row.isNew) {
      let newRows = rows.slice().map((item, i) => {
        if (rowIndex !== i) {
          return item
        } else {
          return {
            ...item,
            isEditMode: false,
            isNew: false,
          }
        }
      })
      newRows.splice(rows.length, 0, newRow)
      setRows(newRows)
    } else {
      onToggleEditMode(rowIndex)
    }
  }

  function onEditCancel(rowIndex: number) {
    setRows(rows
      .map((row, i) => {
        if (i !== rowIndex) {
          return row
        } else {
          return {
            ...dataPointEditableRows[rowIndex]
          }
        }
      })
    )
  }

  return (
    <Card>
      <CardContent>
      
        <Typography variant="h6" gutterBottom>
          Data points
        </Typography>
          
        {combinedVariables.length > 0 &&
          <Table size="small">
            <TableHead>
              <TableRow>
                {rows[0].dataPoints.map((item, index) => 
                  <TableCell key={index}>{item.name}</TableCell>
                )}
                <TableCell />
              </TableRow>
            </TableHead>
            
            <TableBody>
              {rows.map((row, rowIndex) => 
                <TableRow key={rowIndex}>
                  {row.dataPoints.map((item, itemIndex) => 
                    <EditableTableCell
                      value={item.name === SCORE ? item.value[0] : item.value}
                      isEditMode={row.isEditMode}
                      onChange={(value: string) => onEdit(value, rowIndex, itemIndex) }/>
                  )}
                  <TableCell>
                    {row.isEditMode ?
                      <>
                        <IconButton
                          size="small"
                          aria-label="confirm edit"
                          onClick={() => onEditConfirm(row, rowIndex)}>
                          <CheckCircleIcon color="primary" />
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label="cancle edit"
                          onClick={() => onEditCancel(rowIndex)}>
                          <CancelIcon color="primary" />
                        </IconButton>
                      </> :
                      <IconButton
                        size="small"
                        aria-label="toggle edit"
                        onClick={() => onToggleEditMode(rowIndex)}>
                        <EditIcon color="primary" />
                      </IconButton>
                    } 
                  </TableCell>
                </TableRow>
              )}

            </TableBody>
          </Table> 
        }
        
      </CardContent>
    </Card>
  )
}