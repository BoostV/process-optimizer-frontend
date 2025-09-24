import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  Button,
  Box,
} from '@mui/material'
import { EditableTableRow } from './editable-table-row'
import { getRowIndex, getRowId } from './editable-table-util'
import useStyles from './editable-table.style'
import { TableDataRow } from './types'
import { EditableTableViolation } from '@boostv/process-optimizer-frontend-core'
import { Delete } from '@mui/icons-material'
import { useState } from 'react'

export type TableOrder = 'ascending' | 'descending'

type EditableTableProps = {
  rows: TableDataRow[]
  newestFirst: boolean
  onRowAdded: (row: TableDataRow) => void
  onRowsDeleted: (rowIndices: number[]) => void
  onRowEdited: (rowIndex: number, row: TableDataRow) => void
  onRowEnabledToggled: (rowIndex: number, enabled: boolean) => void
  violations?: EditableTableViolation[]
  order: TableOrder
  isEditingDisabled?: boolean
}

export const EditableTable = ({
  rows,
  newestFirst,
  onRowAdded,
  onRowsDeleted,
  onRowEdited,
  onRowEnabledToggled,
  violations,
  order,
  isEditingDisabled,
}: EditableTableProps) => {
  const { classes } = useStyles()
  const [selectedRowIndices, setSelectedRowIndices] = useState<number[]>([])
  const [lastSelectedIndex, setLastSelectedIndex] = useState<
    number | undefined
  >(undefined)
  const isSelectionExists = selectedRowIndices.length > 0

  const selectionControls = (
    <Box className={classes.selectionControls}>
      <Button
        size="small"
        variant="outlined"
        color="primary"
        onClick={() => {
          onRowsDeleted(selectedRowIndices)
          setSelectedRowIndices([])
        }}
        startIcon={<Delete fontSize="small" />}
      >
        Delete selected
      </Button>
      <Button
        size="small"
        variant="outlined"
        color="primary"
        onClick={() => setSelectedRowIndices([])}
      >
        Cancel
      </Button>
    </Box>
  )

  const handleRowSelection = (rowIndex: number, isShiftKeyDown: boolean) => {
    const actualRowIndex = getRowIndex(newestFirst, rowIndex, rows.length)
    // shift key down: range selection
    if (isShiftKeyDown && lastSelectedIndex !== undefined) {
      const startSelection = Math.min(lastSelectedIndex, actualRowIndex)
      const endSelection = Math.max(lastSelectedIndex, actualRowIndex)
      const selectionIndices = []

      for (let i = startSelection; i <= endSelection; i++) {
        selectionIndices.push(i)
      }

      const newSelection = [...selectedRowIndices, ...selectionIndices]
      setSelectedRowIndices(newSelection)
      // regular click: toggle single row
    } else {
      if (selectedRowIndices.includes(actualRowIndex)) {
        setSelectedRowIndices(
          selectedRowIndices.filter(i => i !== actualRowIndex)
        )
      } else {
        setSelectedRowIndices([...selectedRowIndices, actualRowIndex])
        setLastSelectedIndex(actualRowIndex)
      }
    }
  }

  return (
    <>
      <Table size="small" className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell className={classes.emptyCell} />
            <TableCell>#</TableCell>
            {rows[0]?.dataPoints.map((item, index) => (
              <TableCell key={index}>{item.name}</TableCell>
            ))}
            <TableCell align="right">Edit</TableCell>
            <TableCell className={classes.emptyCell} />
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <EditableTableRow
              key={'editablerow' + rowIndex}
              colSpan={row.dataPoints.length + 2}
              rowId={getRowId(newestFirst, rowIndex, rows.length)}
              onSave={(row: TableDataRow) =>
                onRowEdited(
                  getRowIndex(newestFirst, rowIndex, rows.length),
                  row
                )
              }
              onAdd={(row: TableDataRow) => onRowAdded(row)}
              tableRow={row}
              violations={
                violations?.find(v => v.rowMetaId === row.metaId)?.messages
              }
              order={order}
              isEditingDisabled={isEditingDisabled}
              onEnabledToggled={enabled =>
                onRowEnabledToggled(
                  getRowIndex(newestFirst, rowIndex, rows.length),
                  enabled
                )
              }
              isSelectionExists={isSelectionExists}
              isSelected={selectedRowIndices.includes(
                getRowIndex(newestFirst, rowIndex, rows.length)
              )}
              onSelected={(isShiftKeyDown: boolean) =>
                handleRowSelection(rowIndex, isShiftKeyDown)
              }
            />
          ))}
        </TableBody>
        {rows.length > 10 && (
          <TableFooter>
            <TableRow>
              <TableCell className={classes.emptyCell} />
              <TableCell className={classes.emptyFooterCell} />
              {rows[0]?.dataPoints.map((item, index) => (
                <TableCell
                  key={'footercell' + index}
                  className={classes.footerCell}
                >
                  {item.name}
                </TableCell>
              ))}
              <TableCell align="right" className={classes.footerCell}>
                Edit
              </TableCell>
              <TableCell className={classes.emptyCell} />
            </TableRow>
          </TableFooter>
        )}
      </Table>
      {isSelectionExists && selectionControls}
    </>
  )
}
