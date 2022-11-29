import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
} from '@mui/material'
import { EditableTableRow } from './editable-table-row'
import { getRowIndex, getRowId } from './editable-table-util'
import useStyles from './editable-table.style'
import { TableDataRow } from './types'

type EditableTableProps = {
  rows: TableDataRow[]
  newestFirst: boolean
  onRowAdded: (row: TableDataRow) => void
  onRowDeleted: (rowIndex: number) => void
  onRowEdited: (rowIndex: number, row: TableDataRow) => void
}

export const EditableTable = ({
  rows,
  newestFirst,
  onRowAdded,
  onRowDeleted,
  onRowEdited,
}: EditableTableProps) => {
  const { classes } = useStyles()

  return (
    <>
      <Table size="small">
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
              onDelete={() =>
                onRowDeleted(getRowIndex(newestFirst, rowIndex, rows.length))
              }
              onAdd={(row: TableDataRow) => onRowAdded(row)}
              tableRow={row}
            />
          ))}
        </TableBody>
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
      </Table>
    </>
  )
}
