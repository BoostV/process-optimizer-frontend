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
import { Add, Edit } from '@mui/icons-material'

interface EditableTableCollapsedRowProps {
  colSpan: number
  rowId: number
  tableRow: TableDataRow
  setExpanded: (expanded: boolean) => void
  onEnabledToggled: (enabled: boolean) => void
  onSelected: () => void
  isEditingDisabled?: boolean
  isSelectionExists: boolean
  isSelected: boolean
}

export const EditableTableCollapsedRow = ({
  colSpan,
  rowId,
  tableRow,
  setExpanded,
  onEnabledToggled,
  onSelected,
  isEditingDisabled,
  isSelected,
  isSelectionExists,
}: EditableTableCollapsedRowProps) => {
  const { classes } = useStyles()
  const rowEnabled = tableRow.enabled && tableRow.valid

  return (
    <TableRow
      className={
        tableRow.isNew
          ? classes.rowNew
          : isSelected
            ? classes.rowSelected
            : classes.row
      }
      onClick={() => {
        if (!tableRow.isNew) {
          onSelected()
        }
      }}
    >
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
                disabled={isEditingDisabled || isSelectionExists}
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
              type={item.type}
              options={item.options}
              tooltip={item.tooltip}
              style={rowEnabled ? {} : disabledCell}
            />
          ))}
          <TableCell className={classes.editCell}>
            <div className={classes.buttonContainer}>
              <Tooltip disableInteractive title="Edit">
                <span>
                  <IconButton
                    size="small"
                    aria-label="edit"
                    onClick={e => {
                      e.stopPropagation()
                      setExpanded(true)
                    }}
                    disabled={isEditingDisabled}
                  >
                    <Edit
                      fontSize="small"
                      color={isEditingDisabled ? 'disabled' : 'primary'}
                    />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip disableInteractive title="Disable/enable">
                <span>
                  <Checkbox
                    checked={tableRow.enabled}
                    onChange={(_, checked) => {
                      onEnabledToggled(checked)
                    }}
                    onClick={e => e.stopPropagation()}
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
