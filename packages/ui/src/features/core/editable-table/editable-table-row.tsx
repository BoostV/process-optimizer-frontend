import { TableDataRow } from './types'
import { useState } from 'react'
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
  onSelected: (isShiftKeyDown: boolean) => void
  violations?: string[]
  order: TableOrder
  isEditingDisabled?: boolean
  isSelectionExists: boolean
  isSelected: boolean
}

export const EditableTableRow = ({
  tableRow,
  rowId,
  colSpan,
  onSave,
  onAdd,
  onEnabledToggled,
  onSelected,
  violations,
  order,
  isEditingDisabled,
  isSelectionExists,
  isSelected,
}: EditableTableRowProps) => {
  const [expanded, setExpanded] = useState(false)
  const [prevOrder, setPrevOrder] = useState(order)

  if (order !== prevOrder) {
    setPrevOrder(order)
    setExpanded(false)
  }

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
          setExpanded={expanded => setExpanded(expanded)}
          isEditingDisabled={isEditingDisabled}
          onEnabledToggled={enabled => onEnabledToggled(enabled)}
          onSelected={isShiftKeyDown => onSelected(isShiftKeyDown)}
          isSelected={isSelected}
          isSelectionExists={isSelectionExists}
        />
      )}
    </>
  )
}
