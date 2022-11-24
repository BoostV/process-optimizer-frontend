import { TableDataRow } from './types'
import { useState } from 'react'
import { EditableTableExpandedRow } from './editable-table-expanded-row'
import { EditableTableCollapsedRow } from './editable-table-collapsed-row'

interface EditableTableRowProps {
  tableRow: TableDataRow
  colSpan: number
  rowId: number
  onSave: (row: TableDataRow) => void
  onDelete: () => void
  onAdd: (row: TableDataRow) => void
}

export const EditableTableRow = ({
  tableRow,
  rowId,
  colSpan,
  onSave,
  onDelete,
  onAdd,
}: EditableTableRowProps) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      {expanded ? (
        <EditableTableExpandedRow
          colSpan={colSpan + 2}
          rowId={rowId}
          tableRow={tableRow}
          onAdd={row => onAdd(row)}
          onSave={row => onSave(row)}
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
