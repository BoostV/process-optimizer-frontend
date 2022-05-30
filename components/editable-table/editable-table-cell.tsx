import {
  FormControl,
  MenuItem,
  Select,
  TableCell,
  TextField,
  Tooltip,
} from '@material-ui/core'
import { ChangeEvent, CSSProperties, ReactElement } from 'react'
import useStyles from './editable-table-cell.style'

type EditableTableCellProps = {
  value: string
  isEditMode: boolean
  options?: string[]
  onChange: (value: string) => void
  tooltip?: string
  style?: CSSProperties
}

export function EditableTableCell(props: EditableTableCellProps) {
  const { value, isEditMode, options, onChange, tooltip } = props
  const classes = useStyles()

  const textField = (
    <TextField
      size="small"
      value={value}
      onChange={(e: ChangeEvent) =>
        onChange('' + (e.target as HTMLInputElement).value)
      }
    />
  )

  return (
    <>
      {isEditMode ? (
        <TableCell className={classes.cell} style={{ ...props.style }}>
          {options && options.length > 0 ? (
            <FormControl>
              <Select
                value={value}
                onChange={(e: ChangeEvent<any>) =>
                  onChange(e.target.value as string)
                }
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
              {props.tooltip !== undefined ? (
                <Tooltip title={tooltip}>{textField}</Tooltip>
              ) : (
                <>{textField}</>
              )}
            </>
          )}
        </TableCell>
      ) : (
        <TableCell style={{ ...props.style }}>{value}</TableCell>
      )}
    </>
  )
}
