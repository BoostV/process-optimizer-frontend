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
import useStyles from './editable-table.style'

type EditableTableProps = {
  rows: TableDataRow[]
  newestFirst: boolean
  suggestedValues?: (string | number)[]
  onRowAdded: (row: TableDataRow) => void
  onRowDeleted: (rowIndex: number) => void
  onRowEdited: (rowIndex: number, row: TableDataRow) => void
}

export const EditableTable = ({
  rows,
  newestFirst,
  suggestedValues,
  onRowAdded,
  onRowDeleted,
  onRowEdited,
}: EditableTableProps) => {
  const classes = useStyles()

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell className={classes.emptyCell} />
            <TableCell>#</TableCell>
            {rows[0].dataPoints.map((item, index) => (
              <TableCell key={index}>{item.name}</TableCell>
            ))}
            <TableCell align="right">Edit</TableCell>
            <TableCell className={classes.emptyCell} />
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <EditableTableRow
              key={rowIndex}
              colSpan={5} //TODO: Calc colspan
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
            <TableCell className={classes.emptyCell} />
            <TableCell className={classes.emptyFooterCell} />
            {rows[0].dataPoints.map((item, index) => (
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
