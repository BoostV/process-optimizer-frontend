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
} from '@mui/material'
import { TableDataRow } from '../../types/common'
import { EditableTableCell } from './editable-table-cell'
import { useState } from 'react'

interface EditableTableExpandedRowProps {
  colSpan: number
  rowId: number
  tableRow: TableDataRow
  setExpanded: (expanded: boolean) => void
  onAdd: (row: TableDataRow) => void
  onSave: (row: TableDataRow) => void
}

export const EditableTableExpandedRow = ({
  colSpan,
  rowId,
  tableRow,
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
          <Box display="flex">
            <Box className={classes.rowId}>{rowId}</Box>
            <Box pt={1}>
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
            </Box>
          </Box>
          <Box display="flex" justifyContent="end" mt={2}>
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
