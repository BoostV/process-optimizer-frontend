import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
} from '@material-ui/core'
import { TableDataRow } from '../../types/common'
import { getRowId } from '../../utility/ui-util'
import { EditableTableRow } from './editable-table-row'

type EditableTableProps = {
  rows: TableDataRow[]
  newestFirst: boolean
  suggestedValues?: (string | number)[]
  onRowAdded: (row: TableDataRow) => void
  onRowDeleted: (rowIndex: number) => void
  onRowEdited: (rowIndex: number, row: TableDataRow) => void
}

export function EditableTable(props: EditableTableProps) {
  const {
    rows,
    newestFirst,
    suggestedValues,
    onRowAdded,
    onRowDeleted,
    onRowEdited,
  } = props

  const NON_DATA_ROWS = 3

  const isNewEdited = (rows: TableDataRow[]) =>
    rows
      .filter(r => r.isNew)[0]
      .dataPoints.some(
        d => d.name !== 'score' && d.options === undefined && d.value !== ''
      )

  return (
    <>
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
            <EditableTableRow
              colSpan={rows.length + NON_DATA_ROWS}
              rowId={getRowId(newestFirst, rowIndex, rows.length)}
              onSave={(row: TableDataRow) => onRowEdited(rowIndex, row)}
              onDelete={() => onRowDeleted(rowIndex)}
              onAdd={(row: TableDataRow) => onRowAdded(row)}
              tableRow={row}
              suggestedValues={suggestedValues}
            />
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
    </>
  )
}
