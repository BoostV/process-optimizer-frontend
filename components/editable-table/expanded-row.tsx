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
import { TableDataRow } from '../../types/common'
import CloseIcon from '@material-ui/icons/Close'
import { EditableTableCell } from './editable-table-cell'
import { getRowId } from '../../utility/ui-util'

interface ExpandedRowProps {
  newestFirst: boolean
  rowIndex: number
  rowsLength: number
  row: TableDataRow
  onEditCancel: (rowIndex: number) => void
  setExpandedRow: (rowIndex: number) => void
  onEditConfirm: (row: TableDataRow, rowIndex: number) => void
  onEdit: (editValue: string, rowIndex: number, itemIndex: number) => void
}

export const ExpandedRow = ({
  newestFirst,
  rowIndex,
  rowsLength,
  row,
  onEditCancel,
  setExpandedRow,
  onEditConfirm,
  onEdit,
}: ExpandedRowProps) => {
  return (
    <Paper
      key={'expandedcontainer' + rowIndex}
      elevation={2}
      style={{
        padding: 16,
        margin: '8px 4px 8px 4px',
      }}
    >
      <Box display="flex" justifyContent="space-between" mb={1}>
        <span style={{ fontWeight: 500, fontSize: '1rem' }}>
          {getRowId(newestFirst, rowIndex, rowsLength)}
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
                  paddingRight: 16,
                }}
              >
                {d.name}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow key={'expandedheaderow' + rowIndex}>
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
          <TableRow key={'expandedvaluesrow' + rowIndex}>
            {row.dataPoints.map((d, i) => (
              <EditableTableCell
                key={'expandedvalues' + i}
                value={d.value}
                isEditMode
                onChange={(value: string) => onEdit(value, rowIndex, i)}
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
          style={{ float: 'right', marginLeft: 8 }}
          onClick={() => {
            onEditCancel(rowIndex)
            setExpandedRow(-1)
          }}
        >
          Cancel
        </Button>
      </Box>
    </Paper>
  )
}
