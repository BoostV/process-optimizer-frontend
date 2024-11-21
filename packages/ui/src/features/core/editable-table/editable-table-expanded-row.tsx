import { useState } from 'react'
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
                        type={d.type}
                        isEditMode
                        onChange={(value: string) => handleEdit(i, value)}
                        options={d.options}
                        style={{
                          fontSize: 14,
                          border: 'none',
                        }}
                      />
                    ))}
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
