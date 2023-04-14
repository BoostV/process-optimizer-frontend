import useStyles, { disabledCell } from './editable-table-collapsed-row.style'
import {
  Button,
  IconButton,
  TableCell,
  TableRow,
  Tooltip,
  Box,
  Checkbox,
} from '@mui/material'
import { TableDataRow } from './types'
import { EditableTableCell } from './editable-table-cell'
import { Add, Edit, Delete } from '@mui/icons-material'

interface EditableTableCollapsedRowProps {
  colSpan: number
  rowId: number
  tableRow: TableDataRow
  setExpanded: (expanded: boolean) => void
  onDelete: () => void
  onEnabledToggled: (enabled: boolean) => void
  isEditingDisabled?: boolean
}

export const EditableTableCollapsedRow = ({
  colSpan,
  rowId,
  tableRow,
  setExpanded,
  onDelete,
  onEnabledToggled,
  isEditingDisabled,
}: EditableTableCollapsedRowProps) => {
  const { classes } = useStyles()
  const rowEnabled = tableRow.enabled && tableRow.valid

  return (
    <TableRow className={tableRow.isNew ? classes.rowNew : classes.row}>
      {tableRow.isNew ? (
        <>
          <TableCell className={classes.emptyCell} />
          <TableCell
            align="right"
            colSpan={colSpan}
            className={classes.newRowCell}
          >
            <Box m={1}>
              <Button
                size="small"
                onClick={() => setExpanded(true)}
                disabled={isEditingDisabled}
                startIcon={<Add fontSize="small" />}
                variant="outlined"
              >
                Add data point
              </Button>
            </Box>
          </TableCell>
          <TableCell className={classes.emptyCell} />
        </>
      ) : (
        <>
          <TableCell className={classes.emptyCell} />
          <TableCell
            className={classes.cell}
            style={rowEnabled ? {} : disabledCell}
          >
            {rowId}
          </TableCell>
          {tableRow.dataPoints.map((item, itemIndex) => (
            <EditableTableCell
              key={'editablecell' + itemIndex}
              value={item.value}
              isEditMode={false}
              options={item.options}
              tooltip={item.tooltip}
              style={rowEnabled ? {} : disabledCell}
            />
          ))}
          <TableCell className={classes.editCell}>
            <div className={classes.buttonContainer}>
              <Tooltip title="Edit">
                <span>
                  <IconButton
                    size="small"
                    aria-label="edit"
                    onClick={() => setExpanded(true)}
                    disabled={isEditingDisabled}
                  >
                    <Edit
                      fontSize="small"
                      color={isEditingDisabled ? 'disabled' : 'primary'}
                    />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  aria-label="delete"
                  onClick={() => onDelete()}
                >
                  <Delete fontSize="small" color="primary" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Disable/enable">
                <span>
                  <Checkbox
                    checked={tableRow.enabled}
                    onChange={(_, checked) => onEnabledToggled(checked)}
                    inputProps={{
                      'aria-label': 'Enable/disable',
                    }}
                    size="small"
                    color="primary"
                  />
                </span>
              </Tooltip>
            </div>
          </TableCell>
          <TableCell className={classes.emptyCell} />
        </>
      )}
    </TableRow>
  )
}
