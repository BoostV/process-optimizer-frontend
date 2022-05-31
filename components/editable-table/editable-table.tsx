import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  Tooltip,
} from '@material-ui/core'
import { EditableTableCell } from './editable-table-cell'
import EditIcon from '@material-ui/icons/Edit'
import CancelIcon from '@material-ui/icons/Cancel'
import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import EmojiObjectsIcon from '@material-ui/icons/EmojiObjects'
import { TableDataRow } from '../../types/common'
import useStyles from './editable-table.style'
import { useState } from 'react'
import { getRowId } from '../../utility/ui-util'
import { ExpandedRow } from './expanded-row'

type EditableTableProps = {
  rows: TableDataRow[]
  newestFirst: boolean
  suggestedValues?: (string | number)[]
  onEdit: (editValue: string, rowIndex: number, itemIndex: number) => void
  onEditConfirm: (row: TableDataRow, rowIndex: number) => void
  onEditCancel: (rowIndex: number) => void
  onDelete: (rowIndex: number) => void
}

export function EditableTable(props: EditableTableProps) {
  const {
    rows,
    newestFirst,
    suggestedValues,
    onEdit,
    onEditConfirm,
    onEditCancel,
    onDelete,
  } = props
  const classes = useStyles()
  const [expandedRow, setExpandedRow] = useState(-1)

  const NON_DATA_ROWS = 3

  const isNewEdited = (rows: TableDataRow[]) =>
    rows
      .filter(r => r.isNew)[0]
      .dataPoints.some(
        d => d.name !== 'score' && d.options === undefined && d.value !== ''
      )

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>#</TableCell>
          {rows[0].dataPoints.map((item, index) => (
            <TableCell key={index}>{item.name}</TableCell>
          ))}
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, rowIndex) => (
          <>
            {expandedRow !== rowIndex ? (
              <TableRow key={'expandedrow' + rowIndex}>
                <TableCell style={{ color: '#999', paddingRight: '8px' }}>
                  {getRowId(newestFirst, rowIndex, rows.length)}
                </TableCell>
                {row.dataPoints.map((item, itemIndex) => (
                  <>
                    <EditableTableCell
                      key={'editablecell' + itemIndex}
                      value={item.value}
                      isEditMode={row.isEditMode}
                      options={item.options}
                      tooltip={item.tooltip}
                      onChange={(value: string) =>
                        onEdit(value, rowIndex, itemIndex)
                      }
                    />
                  </>
                ))}
                <TableCell
                  key={'buttoncell' + rowIndex}
                  style={{
                    paddingRight: '0px',
                  }}
                >
                  <div className={classes.buttonContainer}>
                    {row.isNew ? (
                      <>
                        <Tooltip title="Add">
                          <IconButton
                            size="small"
                            aria-label="confirm edit"
                            onClick={() => onEditConfirm(row, rowIndex)}
                          >
                            <AddIcon fontSize="small" color="primary" />
                          </IconButton>
                        </Tooltip>
                        {isNewEdited(rows) || suggestedValues === undefined ? (
                          <Tooltip title="Reset">
                            <IconButton
                              size="small"
                              aria-label="cancel edit"
                              onClick={() => onEditCancel(rowIndex)}
                            >
                              <CancelIcon fontSize="small" color="primary" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Use suggested values">
                            <IconButton
                              size="small"
                              aria-label="Use suggested values"
                              onClick={() =>
                                suggestedValues.forEach((s, i) =>
                                  onEdit(s.toString(), rowIndex, i)
                                )
                              }
                            >
                              <EmojiObjectsIcon
                                fontSize="small"
                                color="primary"
                              />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    ) : (
                      <>
                        <Tooltip title="Edit">
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
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            aria-label="delete"
                            onClick={() => onDelete(rowIndex)}
                          >
                            <DeleteIcon fontSize="small" color="primary" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow key={'collapsedrow' + rowIndex}>
                <TableCell
                  colSpan={row.dataPoints.length + NON_DATA_ROWS}
                  style={{
                    paddingRight: 0,
                    paddingTop: 8,
                    paddingBottom: 8,
                  }}
                >
                  <ExpandedRow
                    key={'expandedcontent' + rowIndex}
                    row={row}
                    rowIndex={rowIndex}
                    rowsLength={rows.length}
                    newestFirst={newestFirst}
                    onEdit={(
                      editValue: string,
                      rowIndex: number,
                      itemIndex: number
                    ) => onEdit(editValue, rowIndex, itemIndex)}
                    onEditCancel={(rowIndex: number) => onEditCancel(rowIndex)}
                    onEditConfirm={(row: TableDataRow, rowIndex: number) =>
                      onEditConfirm(row, rowIndex)
                    }
                    setExpandedRow={(rowIndex: number) =>
                      setExpandedRow(rowIndex)
                    }
                  />
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
              key={'footercell' + index}
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
