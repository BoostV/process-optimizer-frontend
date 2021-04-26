import { FormControl, MenuItem, Select, TableCell, TextField } from "@material-ui/core"
import { ChangeEvent } from "react"

type EditableTableCellProps = {
  value: string
  isEditMode: boolean
  options?: string[]
  onChange: (value: string) => void
}

export function EditableTableCell(props: EditableTableCellProps) {
  const { value, isEditMode, options, onChange } = props

  return (
    <>
      {isEditMode ?
        <TableCell>
          {options && options.length > 0 ?
            <FormControl>
              <Select
                value={value}
                onChange={(e: ChangeEvent<any>) => onChange(e.target.value as string)}
                displayEmpty
                inputProps={{ 'aria-label': 'select value' }}>
                {options.map((item, i) => <MenuItem key={i} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
            :
            <TextField
              value={value} 
              onChange={(e: ChangeEvent) => onChange((e.target as HTMLInputElement).value)}/>
          }
        </TableCell>
        : 
        <TableCell>{value}</TableCell>
      }
    </>
  )
}