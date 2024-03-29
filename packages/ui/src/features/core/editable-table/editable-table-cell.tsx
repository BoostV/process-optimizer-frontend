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
import { RatingInput } from '@ui/common'
import { TableDataPointType } from './types'

type EditableTableCellProps = {
  value?: string
  isEditMode: boolean
  type: TableDataPointType
  options?: string[]
  onChange?: (value: string) => void
  tooltip?: string
  style?: CSSProperties
}

export function EditableTableCell({
  value,
  isEditMode,
  type,
  options,
  onChange,
  tooltip,
  style,
}: EditableTableCellProps) {
  const { classes } = useStyles()

  const textField =
    type === 'rating' ? (
      <RatingInput value={value} onChange={val => onChange?.(val)} />
    ) : (
      <TextField
        size="small"
        value={value ?? ''}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onChange?.('' + e.target.value)
        }
      />
    )

  // Value is undefined when new categorical variable is added to existing dataPoints
  const categoricalValue = value === undefined ? '' : value

  return (
    <>
      {isEditMode ? (
        <TableCell className={classes.editCell} style={{ ...style }}>
          {type === 'options' && options && options.length > 0 ? (
            <FormControl>
              <Select
                value={categoricalValue}
                onChange={(e: SelectChangeEvent) => onChange?.(e.target.value)}
                displayEmpty
                inputProps={{ 'aria-label': 'select value' }}
                renderValue={val => val}
                error={!options.includes(categoricalValue)}
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
                <Tooltip disableInteractive title={tooltip}>
                  {textField}
                </Tooltip>
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
