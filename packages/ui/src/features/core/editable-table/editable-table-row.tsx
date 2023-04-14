import { TableDataRow } from './types'
import { useEffect, useState } from 'react'
import { EditableTableExpandedRow } from './editable-table-expanded-row'
import { EditableTableCollapsedRow } from './editable-table-collapsed-row'
import { TableOrder } from './editable-table'

interface EditableTableRowProps {
  tableRow: TableDataRow
  colSpan: number
  rowId: number
  onSave: (row: TableDataRow) => void
  onDelete: () => void
  onAdd: (row: TableDataRow) => void
  onEnabledToggled: (enabled: boolean) => void
  violations?: string[]
  order: TableOrder
  isEditingDisabled?: boolean
}

export const EditableTableRow = ({
  tableRow,
  rowId,
  colSpan,
  onSave,
  onDelete,
  onAdd,
  onEnabledToggled,
  violations,
  order,
  isEditingDisabled,
}: EditableTableRowProps) => {
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setExpanded(false)
  }, [order, setExpanded])

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
          violations={violations}
        />
      ) : (
        <EditableTableCollapsedRow
          colSpan={colSpan}
          rowId={rowId}
          tableRow={tableRow}
          onDelete={() => onDelete()}
          setExpanded={expanded => setExpanded(expanded)}
          isEditingDisabled={isEditingDisabled}
          onEnabledToggled={enabled => onEnabledToggled(enabled)}
        />
      )}
    </>
  )
}
