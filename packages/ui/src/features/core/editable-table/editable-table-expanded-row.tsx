import { ChangeEvent, KeyboardEvent, MouseEvent, useState } from 'react'
import * as R from 'remeda'
import useStyles from './editable-table-expanded-row.style'
import {
  Box,
  Button,
  ClickAwayListener,
  InputAdornment,
  Paper,
  Popper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import { TableDataRow } from './types'
import { EditableTableCell } from './editable-table-cell'
import { InfoBox } from '../info-box/info-box'
import { StarRating } from '@ui/features/data-points/star-rating'

interface EditableTableExpandedRowProps {
  colSpan: number
  rowId: number
  tableRow: TableDataRow
  setExpanded: (expanded: boolean) => void
  onAdd: (row: TableDataRow) => void
  onSave: (row: TableDataRow) => void
  violations?: string[]
}

export const EditableTableExpandedRow = ({
  colSpan,
  rowId,
  tableRow: inputTableRow,
  setExpanded,
  onAdd,
  onSave,
  violations,
}: EditableTableExpandedRowProps) => {
  const tableRow = {
    ...inputTableRow,
    dataPoints: inputTableRow.dataPoints.filter(
      dp => dp !== undefined && dp !== null
    ),
  } satisfies TableDataRow
  const { classes } = useStyles()
  const [editedRow, setEditedRow] = useState<TableDataRow>({ ...tableRow })
  const isModified = !R.equals(editedRow, tableRow)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleEdit = (idx: number, value: string) => {
    setEditedRow({
      ...editedRow,
      dataPoints: [
        ...editedRow.dataPoints.map((d, n) =>
          n === idx
            ? {
                ...d,
                value: value === '' ? undefined : value,
              }
            : d
        ),
      ],
    })
  }

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
                    {editedRow.dataPoints.map((d, i) => {
                      return d.name.includes('score') ? (
                        <TableCell
                          key={'scorecell' + i}
                          style={{ border: 'none', fontSize: 14 }}
                        >
                          <TextField
                            size="small"
                            value={d.value}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleEdit?.(i, '' + e.target.value)
                            }
                            onKeyDown={(e: KeyboardEvent) => {
                              if (e.key === 'Enter') {
                                d.value !== undefined && handleEdit(i, d.value)
                                setAnchorEl(null)
                              }
                            }}
                            onMouseEnter={(e: MouseEvent<HTMLElement>) => {
                              console.log('ent', e, e.currentTarget)
                              setAnchorEl(anchorEl ? null : e.currentTarget)
                            }}
                            onClick={(e: MouseEvent<HTMLElement>) => {
                              console.log('in', e, e.currentTarget)
                              setAnchorEl(anchorEl ? null : e.currentTarget)
                            }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <StarIcon sx={{ color: '#faaf00' }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                          {/* TODO: mouseover should show value but not set it, show on click instead of hover? */}
                          <ClickAwayListener
                            onClickAway={() => setAnchorEl(null)}
                          >
                            <Popper
                              open={Boolean(anchorEl)}
                              anchorEl={anchorEl}
                            >
                              <Paper>
                                <Box pt={1} pl={1} pr={1}>
                                  <StarRating
                                    value={Number(d.value) ?? 5}
                                    onChange={v => {
                                      v !== null && handleEdit(i, '' + v)
                                      setAnchorEl(null)
                                    }}
                                    onHover={v =>
                                      v !== -1 && handleEdit(i, '' + v)
                                    }
                                    max={10}
                                    precision={0.1}
                                  />
                                </Box>
                              </Paper>
                            </Popper>
                          </ClickAwayListener>
                        </TableCell>
                      ) : (
                        <EditableTableCell
                          key={'expandedvalues' + i}
                          value={d.value}
                          isEditMode
                          onChange={(value: string) => handleEdit(i, value)}
                          options={d.options}
                          style={{
                            fontSize: 14,
                            border: 'none',
                          }}
                        />
                      )
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Box>

          {violations !== undefined &&
            violations.length > 0 &&
            violations.map((v, i) => (
              <InfoBox key={i} text={v} type="warning" />
            ))}

          <Box display="flex" justifyContent="end" mt={2}>
            <Button
              variant="outlined"
              size="small"
              style={{ float: 'right', marginLeft: 8 }}
              disabled={!isModified}
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
