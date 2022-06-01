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
  Tooltip,
} from '@material-ui/core'
import { TableDataRow } from '../../types/common'
import CloseIcon from '@material-ui/icons/Close'
import { EditableTableCell } from './editable-table-cell'
import { useState } from 'react'
import EditIcon from '@material-ui/icons/Edit'
import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import useStyles from './editable-table-row.style'

interface EditableTableRowProps {
  tableRow: TableDataRow
  colSpan: number
  rowId: number
  suggestedValues: (string | number)[]
  onSave: (row: TableDataRow) => void
  onDelete: () => void
  onAdd: (row: TableDataRow) => void
}

export const EditableTableRow = ({
  tableRow,
  rowId,
  colSpan,
  suggestedValues,
  onSave,
  onDelete,
  onAdd,
}: EditableTableRowProps) => {
  const [row, setRow] = useState<TableDataRow>({ ...tableRow })
  const [expanded, setExpanded] = useState(false)
  const classes = useStyles()

  return (
    <TableRow>
      {expanded ? (
        <TableCell
          colSpan={colSpan}
          style={{
            paddingRight: 0,
            paddingTop: 8,
            paddingBottom: 8,
          }}
        >
          <Paper
            elevation={2}
            style={{
              padding: 16,
              margin: '8px 4px 8px 4px',
            }}
          >
            <Box display="flex" justifyContent="space-between" mb={1}>
              <span style={{ fontWeight: 500, fontSize: '1rem' }}>{rowId}</span>
              <IconButton
                size="small"
                aria-label="close"
                onClick={() => {
                  setRow({ ...tableRow })
                  setExpanded(false)
                }}
              >
                <CloseIcon fontSize="small" color="primary" />
              </IconButton>
            </Box>

            <Table size="small">
              <TableHead>
                <TableRow>
                  {row.dataPoints.map((d, i) => (
                    <TableCell
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        borderBottom: 'none',
                        paddingRight: 16,
                      }}
                    >
                      {d.name}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {row.dataPoints.map((d, i) => (
                    <TableCell
                      key={'expandedheader' + i}
                      style={{
                        fontSize: '12px',
                        fontWeight: 400,
                        borderBottom: 'none',
                        paddingRight: 16,
                      }}
                    >
                      {d.tooltip}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  {row.dataPoints.map((d, i) => (
                    <EditableTableCell
                      key={'expandedvalues' + i}
                      value={d.value}
                      isEditMode
                      onChange={(value: string) =>
                        setRow({
                          ...row,
                          dataPoints: [
                            ...row.dataPoints.map((d, n) =>
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
                        fontSize: '14px',
                        borderBottom: 'none',
                        paddingRight: row.dataPoints.length - 1 === i ? 0 : 16,
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
                  style={{ float: 'right', marginLeft: 8 }}
                  onClick={() => {
                    console.log('suggestedValues', suggestedValues)
                    setRow({
                      ...row,
                      dataPoints: [
                        ...row.dataPoints.map((d, i) => ({
                          ...d,
                          value: suggestedValues[i].toString(),
                        })),
                      ],
                    })
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
                    onAdd(row)
                  } else {
                    onSave(row)
                  }
                  setRow({ ...tableRow })
                  setExpanded(false)
                }}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                size="small"
                style={{ float: 'right', marginLeft: 8 }}
                onClick={() => {
                  setRow({ ...tableRow })
                  setExpanded(false)
                }}
              >
                Cancel
              </Button>
            </Box>
          </Paper>
        </TableCell>
      ) : (
        <>
          {tableRow.isNew ? (
            <>
              <TableCell
                align="right"
                colSpan={colSpan}
                style={{
                  paddingRight: 0,
                }}
              >
                <Tooltip title="Add data point">
                  <IconButton
                    size="small"
                    aria-label="expand"
                    onClick={() => setExpanded(true)}
                  >
                    <AddIcon fontSize="small" color="primary" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </>
          ) : (
            <>
              <TableCell style={{ color: '#999', paddingRight: '8px' }}>
                {rowId}
              </TableCell>
              {tableRow.dataPoints.map((item, itemIndex) => (
                <>
                  <EditableTableCell
                    key={'editablecell' + itemIndex}
                    value={item.value}
                    isEditMode={false}
                    options={item.options}
                    tooltip={item.tooltip}
                  />
                </>
              ))}
              <TableCell
                style={{
                  paddingRight: '0px',
                }}
              >
                <div className={classes.buttonContainer}>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      aria-label="expand"
                      onClick={() => setExpanded(true)}
                    >
                      <EditIcon fontSize="small" color="primary" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      aria-label="delete"
                      onClick={() => onDelete()}
                    >
                      <DeleteIcon fontSize="small" color="primary" />
                    </IconButton>
                  </Tooltip>
                </div>
              </TableCell>
            </>
          )}
        </>
      )}
    </TableRow>
  )
}
