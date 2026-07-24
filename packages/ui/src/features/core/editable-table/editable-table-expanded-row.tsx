import { Fragment, useState } from 'react'
import * as R from 'remeda'
import useStyles from './editable-table-expanded-row.style'
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material'

import { TableDataRow } from './types'
import { EditableTableCell } from './editable-table-cell'
import { InfoBox } from '../info-box/info-box'

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
  const isModified = !R.isDeepEqual(editedRow, tableRow)

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

  const handleResponseEdit = (
    scoreName: string,
    symbol: string,
    value: string
  ) => {
    setEditedRow({
      ...editedRow,
      scoreFunctions: editedRow.scoreFunctions?.map(sf =>
        sf.scoreName === scoreName
          ? { ...sf, values: { ...sf.values, [symbol]: value } }
          : sf
      ),
    })
  }

  const handleToggleUseFunction = (scoreName: string) => {
    setEditedRow({
      ...editedRow,
      scoreFunctions: editedRow.scoreFunctions?.map(sf =>
        sf.scoreName === scoreName
          ? { ...sf, useFunction: !sf.useFunction }
          : sf
      ),
    })
  }

  // Objectives that show response inputs, and the widest response count, so the
  // inputs can be laid out in a grid where column N of every objective aligns.
  const responseObjectives = (editedRow.scoreFunctions ?? []).filter(
    sf => sf.hasFunction && sf.responseVars.length > 0
  )
  const maxResponseVars = responseObjectives.reduce(
    (max, sf) => Math.max(max, sf.responseVars.length),
    0
  )

  return (
    <TableRow className={classes.row}>
      {/* colSpan already equals the table's full column count; adding more would
          create phantom columns that disturb the fixed-layout column widths
          (only while a row is expanded). */}
      <TableCell colSpan={colSpan} className={classes.spanCell}>
        <Paper elevation={2} className={classes.paper}>
          <Box
            sx={{
              display: 'flex',
            }}
          >
            <Box className={classes.rowId}>{rowId}</Box>
            <Box
              className={classes.fields}
              sx={{
                pt: 1,
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {editedRow.dataPoints.map((d, i) => (
                      <TableCell
                        key={'header' + i}
                        className={classes.rowHeaderCell}
                      >
                        {d.label ?? d.name}
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
                      const scoreFunction = editedRow.scoreFunctions?.find(
                        sf => sf.scoreName === d.name && sf.hasFunction
                      )
                      return (
                        <EditableTableCell
                          key={'expandedvalues' + i}
                          value={d.value}
                          type={d.type}
                          isEditMode
                          onChange={(value: string) => handleEdit(i, value)}
                          options={d.options}
                          scoreName={scoreFunction ? d.name : undefined}
                          scoreFunction={
                            scoreFunction
                              ? {
                                  hasFunction: scoreFunction.hasFunction,
                                  useFunction: scoreFunction.useFunction,
                                }
                              : undefined
                          }
                          onToggleUseFunction={
                            scoreFunction
                              ? () => handleToggleUseFunction(d.name)
                              : undefined
                          }
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

          {responseObjectives.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ fontWeight: 'bold', mb: 1 }}>Response</Box>
              {/* Grid: label column + one column per response slot, so the Nth
                  input of every objective lines up in the same column. */}
              <Box
                sx={{
                  display: 'grid',
                  // content-sized input columns (capped per-field via maxWidth)
                  // instead of 1fr, so inputs stay compact rather than stretch.
                  gridTemplateColumns: `auto repeat(${maxResponseVars}, auto)`,
                  columnGap: 2,
                  rowGap: 1,
                  alignItems: 'center',
                  justifyContent: 'start',
                }}
              >
                {responseObjectives.map(sf => (
                  <Fragment key={sf.scoreName}>
                    <Box sx={{ whiteSpace: 'nowrap' }}>{sf.label}</Box>
                    {sf.responseVars.map(rv => (
                      <TextField
                        key={rv.symbol}
                        size="small"
                        label={rv.name}
                        slotProps={{
                          htmlInput: { 'aria-label': rv.name },
                          inputLabel: { shrink: true },
                        }}
                        value={sf.values[rv.symbol] ?? ''}
                        onChange={e =>
                          handleResponseEdit(
                            sf.scoreName,
                            rv.symbol,
                            e.target.value
                          )
                        }
                        sx={{ maxWidth: '10rem' }}
                      />
                    ))}
                    {/* pad short rows so later columns stay aligned */}
                    {Array.from({
                      length: maxResponseVars - sf.responseVars.length,
                    }).map((_, i) => (
                      <Box key={`pad-${sf.scoreName}-${i}`} />
                    ))}
                  </Fragment>
                ))}
              </Box>
            </Box>
          )}

          {violations !== undefined &&
            violations.length > 0 &&
            violations.map((v, i) => (
              <InfoBox key={'warning' + i} text={v} type="warning" />
            ))}

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'end',
              mt: 2,
            }}
          >
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
