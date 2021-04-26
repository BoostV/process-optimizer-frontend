import { IconButton, Table, TableBody, TableCell, TableHead, TableRow } from "@material-ui/core"
import { EditableTableCell } from "./editable-table-cell"
import EditIcon from "@material-ui/icons/Edit"
import CheckCircleIcon from "@material-ui/icons/CheckCircle"
import CancelIcon from "@material-ui/icons/Cancel"
import AddIcon from "@material-ui/icons/Add"
import DeleteIcon from "@material-ui/icons/Delete";
import { TableDataRow } from "../types/common";

type EditableTableProps = {
  rows: TableDataRow[]
  useArrayForValue: string
  onEdit: (editValue: string, rowIndex: number, itemIndex: number) => void
  onEditConfirm: (row: TableDataRow, rowIndex: number) => void
  onEditCancel: (rowIndex: number) => void
  onToggleEditMode: (rowIndex: number) => void
  onDelete: (rowIndex: number) => void
}

export function EditableTable(props: EditableTableProps) {
  const { rows, useArrayForValue, onEdit, onEditConfirm, onEditCancel, onToggleEditMode, onDelete } = props

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          {rows[0].dataPoints.map((item, index) => 
            <TableCell key={index}>{item.name}</TableCell>
          )}
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, rowIndex) => 
          <TableRow key={rowIndex}>
            {row.dataPoints.map((item, itemIndex) => 
              <EditableTableCell
                key={itemIndex}
                value={item.name === useArrayForValue ? item.value[0] : item.value}
                isEditMode={row.isEditMode}
                options={item.options}
                onChange={(value: string) => onEdit(value, rowIndex, itemIndex) }/>
            )}
            <TableCell key={rowIndex}>
              {row.isEditMode ?
                <>
                  <IconButton
                    size="small"
                    aria-label="confirm edit"
                    onClick={() => onEditConfirm(row, rowIndex)}>
                    {row.isNew ? <AddIcon color="primary" /> : 
                    <CheckCircleIcon color="primary" />}
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label="cancle edit"
                    onClick={() => onEditCancel(rowIndex)}>
                    <CancelIcon color="primary" />
                  </IconButton>
                </> :
                <>
                  <IconButton
                    size="small"
                    aria-label="toggle edit"
                    onClick={() => onToggleEditMode(rowIndex)}>
                    <EditIcon color="primary" />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label="delete"
                    onClick={() => onDelete(rowIndex)}>
                    <DeleteIcon color="primary" />
                  </IconButton>
                </>
              } 
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table> 
  )
}