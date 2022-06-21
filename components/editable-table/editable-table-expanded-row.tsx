import useStyles from './editable-table-expanded-row.style'
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import { TableDataRow } from '../../types/common'
import { EditableTableCell } from './editable-table-cell'
import { useState } from 'react'

interface EditableTableExpandedRowProps {
  colSpan: number
  rowId: number
  tableRow: TableDataRow
  suggestedValues: (string | number)[]
  setExpanded: (expanded: boolean) => void
  onAdd: (row: TableDataRow) => void
  onSave: (row: TableDataRow) => void
}

export const EditableTableExpandedRow = ({
  colSpan,
  rowId,
  tableRow,
  suggestedValues,
  setExpanded,
  onAdd,
  onSave,
}: EditableTableExpandedRowProps) => {
  const classes = useStyles()
  const [editedRow, setEditedRow] = useState<TableDataRow>({ ...tableRow })

  return (
    <TableRow className={classes.row}>
      <TableCell colSpan={colSpan + 2} className={classes.spanCell}>
        <Paper elevation={2} className={classes.paper}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <span className={classes.rowId}>{rowId}</span>
            <IconButton
              size="small"
              aria-label="close"
              onClick={() => setExpanded(false)}
            >
              <CloseIcon fontSize="small" color="primary" />
            </IconButton>
          </Box>

          <Table size="small">
            <TableHead>
              <TableRow>
                {editedRow.dataPoints.map((d, i) => (
                  <TableCell
                    key={'header' + i}
                    className={classes.rowHeaderCell}
                  >
                    {d.name}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {editedRow.dataPoints.map((d, i) => (
                  <TableCell
                    key={'subheader' + i}
                    className={classes.rowMetaHeaderCell}
                  >
                    {d.tooltip}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                {editedRow.dataPoints.map((d, i) => (
                  <EditableTableCell
                    key={'expandedvalues' + i}
                    value={d.value}
                    isEditMode
                    onChange={(value: string) =>
                      setEditedRow({
                        ...editedRow,
                        dataPoints: [
                          ...editedRow.dataPoints.map((d, n) =>
                            n === i
                              ? {
                                  ...d,
                                  value,
                                }
                              : d
                          ),
                        ],
                      })
                    }
                    options={d.options}
                    style={{
                      fontSize: 14,
                      border: 'none',
                      paddingRight:
                        editedRow.dataPoints.length - 1 === i ? 0 : 16,
                    }}
                  />
                ))}
              </TableRow>
            </TableBody>
          </Table>
          <Box display="flex" justifyContent="end" mt={2}>
            {tableRow.isNew && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const suggestedRow: TableDataRow = {
                    ...editedRow,
                    dataPoints: [
                      ...editedRow.dataPoints.map((d, i) => ({
                        ...d,
                        value:
                          suggestedValues[i] !== undefined
                            ? '' + suggestedValues[i]
                            : '',
                      })),
                    ],
                  }
                  setEditedRow({ ...suggestedRow })
                }}
              >
                Insert suggested values
              </Button>
            )}
            <Button
              variant="outlined"
              size="small"
              style={{ float: 'right', marginLeft: 8 }}
              onClick={() => {
                if (tableRow.isNew) {
                  onAdd(editedRow)
                } else {
                  onSave(editedRow)
                }
                setExpanded(false)
              }}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              size="small"
              style={{ float: 'right', marginLeft: 8 }}
              onClick={() => setExpanded(false)}
            >
              Cancel
            </Button>
          </Box>
        </Paper>
      </TableCell>
    </TableRow>
  )
}
