import { TableCell, TextField } from "@material-ui/core"
import { ChangeEvent, useState } from "react"
import { DataPointType, SCORE } from "../types/common"

type EditableTableCellProps = {
  dataPoint: DataPointType
  isEditMode: Boolean
  onChange: (value: string) => void
}

export function EditableTableCell(props: EditableTableCellProps) {
  const { dataPoint, isEditMode, onChange } = props
  const [value, setValue] = useState<string>(dataPoint.name === SCORE ? dataPoint.value[0] : dataPoint.value)

  return (
    <>
      {isEditMode ?
        <TableCell>
          <TextField 
            value={value} 
            onChange={(e: ChangeEvent) => {
              const value = (e.target as HTMLInputElement).value
              setValue(value)
              onChange(value)
            }}/>
        </TableCell>
        : 
        <TableCell>{value}</TableCell>
      }
    </>
  )
}