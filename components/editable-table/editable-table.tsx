import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
} from '@material-ui/core'
import { EditableTableCell } from './editable-table-cell'
import EditIcon from '@material-ui/icons/Edit'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import CancelIcon from '@material-ui/icons/Cancel'
import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import CloseIcon from '@material-ui/icons/Close'
import { TableDataRow } from '../../types/common'
import useStyles from './editable-table.style'
import { useState } from 'react'

type EditableTableProps = {
  rows: TableDataRow[]
  newestFirst: boolean
  onEdit: (editValue: string, rowIndex: number, itemIndex: number) => void
  onEditConfirm: (row: TableDataRow, rowIndex: number) => void
  onEditCancel: (rowIndex: number) => void
  onToggleEditMode: (rowIndex: number) => void
  onDelete: (rowIndex: number) => void
}

export function EditableTable(props: EditableTableProps) {
  const {
    rows,
    newestFirst,
    onEdit,
    onEditConfirm,
    onEditCancel,
    onToggleEditMode,
    onDelete,
  } = props
  const classes = useStyles()
  const [expandedRow, setExpandedRow] = useState(-1)

  const NON_DATA_ROWS = 3

  const getRowId = (
    newestFirst: boolean,
    rowIndex: number,
    rowsLength: number
  ) => (newestFirst ? rowIndex + 1 : rowsLength - rowIndex)

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>#</TableCell>
          {rows[0].dataPoints.map((item, index) => (
            <TableCell
              key={index}
              style={
                {
                  // paddingLeft: index === 0 ? '32px' : '0px',
                  // border: 'none'
                }
              }
            >
              {item.name}
            </TableCell>
          ))}
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, rowIndex) => (
          <>
            {expandedRow !== rowIndex ? (
              <TableRow key={'expanded' + rowIndex}>
                <TableCell style={{ color: '#999', paddingRight: '8px' }}>
                  {getRowId(newestFirst, rowIndex, rows.length)}
                </TableCell>
                {row.dataPoints.map((item, itemIndex) => (
                  <>
                    <EditableTableCell
                      key={itemIndex}
                      value={item.value}
                      isEditMode={row.isEditMode}
                      options={item.options}
                      tooltip={item.tooltip}
                      onChange={(value: string) =>
                        onEdit(value, rowIndex, itemIndex)
                      }
                      style={
                        {
                          // paddingLeft: itemIndex === 0 ? '32px' : '0px',
                          // border: 'none'
                        }
                      }
                    />
                  </>
                ))}
                <TableCell
                  key={'b' + rowIndex}
                  style={{
                    // border: 'none',
                    // paddingRight: '32px'
                    paddingRight: '0px',
                  }}
                >
                  <div className={classes.buttonContainer}>
                    {row.isEditMode ? (
                      <>
                        <IconButton
                          size="small"
                          aria-label="confirm edit"
                          onClick={() => onEditConfirm(row, rowIndex)}
                        >
                          {row.isNew ? (
                            <AddIcon fontSize="small" color="primary" />
                          ) : (
                            <CheckCircleIcon fontSize="small" color="primary" />
                          )}
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label="cancel edit"
                          onClick={() => onEditCancel(rowIndex)}
                        >
                          <CancelIcon fontSize="small" color="primary" />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        {/* <IconButton
                          size="small"
                          aria-label="toggle edit"
                          onClick={() => onToggleEditMode(rowIndex)}
                        >
                          <EditIcon fontSize="small" color="primary" />
                        </IconButton> */}
                        <IconButton
                          size="small"
                          aria-label="expand"
                          onClick={() => {
                            if (expandedRow !== -1) {
                              onEditCancel(expandedRow)
                            }
                            setExpandedRow(rowIndex)
                          }}
                        >
                          <EditIcon fontSize="small" color="primary" />
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label="delete"
                          onClick={() => onDelete(rowIndex)}
                        >
                          <DeleteIcon fontSize="small" color="primary" />
                        </IconButton>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow key={rowIndex}>
                <TableCell
                  colSpan={row.dataPoints.length + NON_DATA_ROWS}
                  style={{
                    // border: 'none',
                    paddingRight: '0px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                  }}
                >
                  <Paper
                    elevation={2}
                    style={{
                      padding: '16px',
                      margin: '8px 4px 8px 4px',
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <span style={{ fontWeight: 500, fontSize: '1rem' }}>
                        {getRowId(newestFirst, rowIndex, rows.length)}
                      </span>
                      <IconButton
                        size="small"
                        aria-label="delete"
                        onClick={() => {
                          onEditCancel(rowIndex)
                          setExpandedRow(-1)
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
                                paddingRight: '16px',
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
                              style={{
                                fontSize: '12px',
                                fontWeight: 400,
                                borderBottom: 'none',
                                paddingRight: '16px',
                              }}
                            >
                              {d.tooltip}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          {row.dataPoints.map((d, i) => (
                            <EditableTableCell
                              value={d.value}
                              isEditMode
                              onChange={(value: string) =>
                                onEdit(value, rowIndex, i)
                              }
                              options={d.options}
                              style={{
                                fontSize: '14px',
                                paddingRight: 16,
                                borderBottom: 'none',
                              }}
                            />
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                    <Box display="flex" justifyContent="end" mt={2}>
                      <Button
                        variant="outlined"
                        size="small"
                        style={{ float: 'right' }}
                        onClick={() => {
                          onEditConfirm(row, rowIndex)
                          setExpandedRow(-1)
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        style={{ float: 'right', marginLeft: '8px' }}
                        onClick={() => {
                          onEditCancel(rowIndex)
                          setExpandedRow(-1)
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Paper>
                </TableCell>
              </TableRow>
            )}
          </>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell />
          {rows[0].dataPoints.map((item, index) => (
            <TableCell
              key={index}
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                lineHeight: '1.5rem',
                color: 'black',
              }}
            >
              {item.name}
            </TableCell>
          ))}
          <TableCell />
        </TableRow>
      </TableFooter>
    </Table>
  )
}
