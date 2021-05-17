import { FormControl, MenuItem, Select, TableCell, TextField } from "@material-ui/core"
import { ChangeEvent } from "react"

type EditableTableCellProps = {
  value: string
  name: string
  isEditMode: boolean
  options?: string[]
  onChange: (value: string) => void
  nonEditableItems?: string[]
}

export function EditableTableCell(props: EditableTableCellProps) {
  const { value, isEditMode, options, onChange, name, nonEditableItems } = props

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
            <>
              {nonEditableItems?.find(v => v === name) === undefined ?
                <TextField
                  size="small"
                  value={value} 
                  onChange={(e: ChangeEvent) => onChange("" + (e.target as HTMLInputElement).value)}/>
                  : value
                } 
            </>
          }
        </TableCell>
        : 
        <TableCell>{value}</TableCell>
      }
    </>
  )
}