import { Card, CardContent, Typography } from "@material-ui/core";
import { useEffect, useState } from "react";
import { ExperimentType, VariableType, DataPointType, TableDataRow, SCORE, TableDataPointValue } from "../types/common";
import { EditableTable } from "./editable-table";

type DataPointProps = {
  experiment: ExperimentType
  onUpdateDataPoints: (dataPoints: DataPointType[][]) => void
}

export default function DataPoints(props: DataPointProps) {
  const { experiment: { valueVariables, categoricalVariables, dataPoints }, onUpdateDataPoints } = props
  const combinedVariables: VariableType[] = valueVariables.map(item => item as VariableType).concat(categoricalVariables.map(item => item as VariableType))
  
  const newRow: TableDataRow = {
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
  
  const dataPointRows: TableDataRow[] = dataPoints.map(item => {
      return {
        dataPoints: item,
        isEditMode: false,
        isNew: false,
      }
    }
  ).concat(newRow)

  //TODO: Use reducer?
  const [rows, setRows] = useState<TableDataRow[]>(dataPointRows)

  useEffect(() => {
    setRows(dataPointRows)
  }, [props.experiment])

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
                  value: (point.name === SCORE ? [editValue] : editValue) as TableDataPointValue
                }
              }
            })
          }
        }
      })
    )
  }

  function onEditConfirm(row: TableDataRow, rowIndex: number) {
    onUpdateDataPoints(rows
      .filter(item => row.isNew || !item.isNew)
      .map((item, i) => {
        return item.dataPoints.map(item => item as DataPointType)
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
            ...dataPointRows[rowIndex]
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
          <EditableTable
            rows={rows}
            onEdit={(editValue: string, rowIndex: number, itemIndex: number) => onEdit(editValue, rowIndex, itemIndex)}
            onEditConfirm={(row: TableDataRow, rowIndex: number) => onEditConfirm(row, rowIndex)}
            onEditCancel={(rowIndex: number) => onEditCancel(rowIndex)}
            onToggleEditMode={(rowIndex: number) => onToggleEditMode(rowIndex)} />
        }
        
      </CardContent>
    </Card>
  )
}