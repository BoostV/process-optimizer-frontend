import { TableDataRow } from '../../types/common'
import { useState } from 'react'
import { EditableTableExpandedRow } from './editable-table-expanded-row'
import { EditableTableCollapsedRow } from './editable-table-collapsed-row'

interface EditableTableRowProps {
  tableRow: TableDataRow
  colSpan: number
  rowId: number
  suggestedValues: (string | number)[]
  onSave: (row: TableDataRow) => void
  onDelete: () => void
  onAdd: (row: TableDataRow) => void
}

export const EditableTableRow = ({
  tableRow,
  rowId,
  colSpan,
  suggestedValues,
  onSave,
  onDelete,
  onAdd,
}: EditableTableRowProps) => {
  const [row, setRow] = useState<TableDataRow>({ ...tableRow })
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      {expanded ? (
        <EditableTableExpandedRow
          colSpan={colSpan + 2}
          rowId={rowId}
          row={row}
          tableRow={tableRow}
          onAdd={row => onAdd(row)}
          onSave={row => onSave(row)}
          setRow={row => setRow(row)}
          setExpanded={expanded => setExpanded(expanded)}
        />
      ) : (
        <EditableTableCollapsedRow
          colSpan={colSpan}
          rowId={rowId}
          tableRow={tableRow}
          onDelete={() => onDelete()}
          setExpanded={expanded => setExpanded(expanded)}
        />
      )}
    </>
  )
}
