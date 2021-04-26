import { TableCell, TextField } from "@material-ui/core"
import { ChangeEvent } from "react"

type EditableTableCellProps = {
  value: string
  isEditMode: Boolean
  onChange: (value: string) => void
}

export function EditableTableCell(props: EditableTableCellProps) {
  const { value, isEditMode, onChange } = props

  return (
    <>
      {isEditMode ?
        <TableCell>
          <TextField
            value={value} 
            onChange={(e: ChangeEvent) => onChange((e.target as HTMLInputElement).value)}/>
        </TableCell>
        : 
        <TableCell>{value}</TableCell>
      }
    </>
  )
}