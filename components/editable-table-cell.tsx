import { TableCell, TextField } from "@material-ui/core"
import { ChangeEvent, useState } from "react"
import { DataPointType } from "../types/common"

type EditableTableCellProps = {
  key: any
  dataPoint: DataPointType
  isEditMode: Boolean
  onChange: (value: string) => void
}

export function EditableTableCell(props: EditableTableCellProps) {
  const { key, dataPoint, isEditMode, onChange } = props
  const [value, setValue] = useState<string>(dataPoint.name === "score" ? dataPoint.value[0] : dataPoint.value)

  return (
    <>
      {isEditMode ?
        <TableCell key={key}>
          <TextField 
            value={value} 
            onChange={(e: ChangeEvent) => {
              const value = (e.target as HTMLInputElement).value
              setValue(value)
              onChange(value)
            }}/>
        </TableCell>
        : 
        <TableCell key={key}>{value}</TableCell>
      }
    </>
  )
}