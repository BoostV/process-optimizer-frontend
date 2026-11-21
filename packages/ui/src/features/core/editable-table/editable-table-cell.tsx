import {
  Box,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  TableCell,
  TextField,
  Tooltip,
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
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
  scoreName?: string
  scoreFunction?: { hasFunction: boolean; useFunction: boolean }
  onToggleUseFunction?: () => void
  onOpenScoreFunctions?: () => void
}

export function EditableTableCell({
  value,
  isEditMode,
  type,
  options,
  onChange,
  tooltip,
  style,
  scoreName,
  scoreFunction,
  onToggleUseFunction,
  onOpenScoreFunctions,
}: EditableTableCellProps) {
  const { classes } = useStyles()

  const readOnly = scoreFunction?.useFunction ?? false

  const textField =
    type === 'rating' ? (
      <RatingInput
        value={value}
        onChange={val => onChange?.(val)}
        readOnly={readOnly}
      />
    ) : (
      <TextField
        size="small"
        value={value ?? ''}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onChange?.('' + e.target.value)
        }
        slotProps={{ htmlInput: { readOnly } }}
      />
    )

  const hasFunction = scoreFunction?.hasFunction ?? false
  // When defined, "Use <name> function"; when not, "Define <name> function".
  const fxTitle = hasFunction
    ? `Use ${scoreName} function`
    : `Define ${scoreName} function`

  const fxToggle = scoreFunction ? (
    <Tooltip disableInteractive title={fxTitle}>
      <IconButton
        size="small"
        aria-label={fxTitle}
        color={hasFunction && scoreFunction.useFunction ? 'primary' : 'default'}
        onClick={() =>
          hasFunction ? onToggleUseFunction?.() : onOpenScoreFunctions?.()
        }
      >
        <Box component="span" sx={{ fontSize: 13, fontStyle: 'italic' }}>
          f(x)
        </Box>
      </IconButton>
    </Tooltip>
  ) : null

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
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {tooltip !== undefined ? (
                <Tooltip disableInteractive title={tooltip}>
                  {textField}
                </Tooltip>
              ) : (
                <>{textField}</>
              )}
              {fxToggle}
            </Box>
          )}
        </TableCell>
      ) : (
        <TableCell className={classes.cell} style={{ ...style }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {value}
            {scoreFunction?.hasFunction && !scoreFunction.useFunction && (
              <Tooltip disableInteractive title="User defined value">
                <PersonIcon fontSize="small" color="action" />
              </Tooltip>
            )}
          </Box>
        </TableCell>
      )}
    </>
  )
}
