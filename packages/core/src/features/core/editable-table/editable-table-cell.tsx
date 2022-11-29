import {
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  TableCell,
  TextField,
  Tooltip,
} from '@mui/material'
import { ChangeEvent, CSSProperties } from 'react'
import useStyles from './editable-table-cell.style'

type EditableTableCellProps = {
  value: string
  isEditMode: boolean
  options?: string[]
  onChange?: (value: string) => void
  tooltip?: string
  style?: CSSProperties
}

export function EditableTableCell({
  value,
  isEditMode,
  options,
  onChange,
  tooltip,
  style,
}: EditableTableCellProps) {
  const { classes } = useStyles()

  const textField = (
    <TextField
      size="small"
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) =>
        onChange?.('' + e.target.value)
      }
    />
  )

  return (
    <>
      {isEditMode ? (
        <TableCell className={classes.editCell} style={{ ...style }}>
          {options && options.length > 0 ? (
            <FormControl>
              <Select
                value={value}
                onChange={(e: SelectChangeEvent) => onChange?.(e.target.value)}
                displayEmpty
                inputProps={{ 'aria-label': 'select value' }}
              >
                {options.map((item, i) => (
                  <MenuItem key={i} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <>
              {tooltip !== undefined ? (
                <Tooltip title={tooltip}>{textField}</Tooltip>
              ) : (
                <>{textField}</>
              )}
            </>
          )}
        </TableCell>
      ) : (
        <TableCell className={classes.cell} style={{ ...style }}>
          {value}
        </TableCell>
      )}
    </>
  )
}
