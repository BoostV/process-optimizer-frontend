import { ChangeEvent, MouseEvent, useState } from 'react'
import * as R from 'remeda'
import useStyles from './editable-table-expanded-row.style'
import {
  Box,
  Button,
  ClickAwayListener,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Popper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
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
  const [tempRating, setTempRating] = useState<string | undefined>(undefined)

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

  const formatRating = (
    rating: string | undefined,
    value: string | undefined
  ) => {
    if (rating === undefined) {
      return value === undefined
        ? ''
        : Number(value) % 1 === 0
        ? value + '.0'
        : value
    }
    if (Number(rating) % 1 === 0) {
      return rating + '.0'
    }
    return rating
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
                          style={{
                            border: 'none',
                            fontSize: 14,
                            minWidth: 90,
                          }}
                        >
                          <TextField
                            size="small"
                            value={d.value}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleEdit?.(i, '' + e.target.value)
                            }
                            InputProps={{
                              sx: {
                                paddingRight: 0.5,
                              },
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={(e: MouseEvent<HTMLElement>) =>
                                      setAnchorEl(e.currentTarget)
                                    }
                                  >
                                    <StarIcon sx={{ color: '#faaf00' }} />
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                          <Popper open={Boolean(anchorEl)} anchorEl={anchorEl}>
                            <ClickAwayListener
                              onClickAway={() => {
                                setAnchorEl(null)
                                setTempRating(undefined)
                              }}
                            >
                              <Paper>
                                <Stack
                                  padding={1}
                                  spacing={1}
                                  divider={
                                    <Divider orientation="vertical" flexItem />
                                  }
                                  direction="row"
                                  alignItems="center"
                                >
                                  <Typography
                                    variant="body2"
                                    width={24}
                                    textAlign="center"
                                    fontWeight={500}
                                    color="#7a7a7a"
                                  >
                                    {formatRating(tempRating, d.value)}
                                  </Typography>
                                  <StarRating
                                    value={Number(d.value) ?? 5}
                                    onChange={v => {
                                      v !== null &&
                                        handleEdit(i, '' + tempRating)
                                      setAnchorEl(null)
                                      setTempRating(undefined)
                                    }}
                                    onHover={v =>
                                      v !== -1 && setTempRating('' + v)
                                    }
                                    max={10}
                                    precision={0.1}
                                  />
                                </Stack>
                              </Paper>
                            </ClickAwayListener>
                          </Popper>
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
              <InfoBox key={'warning' + i} text={v} type="warning" />
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
