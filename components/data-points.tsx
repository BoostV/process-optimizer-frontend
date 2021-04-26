import { Card, CardContent, Typography } from "@material-ui/core";
import { useEffect, useState } from "react";
import { ExperimentType, VariableType, DataPointType, TableDataPoint, TableDataPointValue, TableDataRow } from "../types/common";
import { EditableTable } from "./editable-table";

type DataPointProps = {
  experiment: ExperimentType
  onUpdateDataPoints: (dataPoints: DataPointType[][]) => void
}

const SCORE = "score"

export default function DataPoints(props: DataPointProps) {
  const { experiment: { valueVariables, categoricalVariables, dataPoints }, onUpdateDataPoints } = props
  const combinedVariables: VariableType[] = valueVariables.concat(categoricalVariables)
  
  const newRow: TableDataRow = {
    dataPoints: combinedVariables.map((variable, i) => {
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
  ).concat(newRow as any)

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
    updateDataPoints(rows.filter(item => row.isNew || !item.isNew))
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

  function onDelete(rowIndex: number) {
    let rowsAfterDelete: TableDataRow[] = rows.slice()
    rowsAfterDelete.splice(rowIndex, 1)
    updateDataPoints(rowsAfterDelete.filter(row => !row.isNew))
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
            useArrayForValue={SCORE}
            onEdit={(editValue: string, rowIndex: number, itemIndex: number) => onEdit(editValue, rowIndex, itemIndex)}
            onEditConfirm={(row: TableDataRow, rowIndex: number) => onEditConfirm(row, rowIndex)}
            onEditCancel={(rowIndex: number) => onEditCancel(rowIndex)}
            onToggleEditMode={(rowIndex: number) => onToggleEditMode(rowIndex)}
            onDelete={(rowIndex: number) => onDelete(rowIndex)} />
        }
        
      </CardContent>
    </Card>
  )
}