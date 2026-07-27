import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { EditableTableCollapsedRow } from './editable-table-collapsed-row'
import type { TableDataRow } from './types'

afterEach(() => cleanup())

const baseRow: TableDataRow = {
  isNew: false,
  enabled: true,
  valid: true,
  metaId: 1,
  dataPoints: [{ name: 'A', value: '1', type: 'numeric' }],
}

const renderRow = (tableRow: TableDataRow) =>
  render(
    <table>
      <tbody>
        <EditableTableCollapsedRow
          colSpan={4}
          rowId={1}
          tableRow={tableRow}
          setExpanded={() => {}}
          onEnabledToggled={() => {}}
          onSelected={() => {}}
          isSelectionExists={false}
          isSelected={false}
        />
      </tbody>
    </table>
  )

describe('EditableTableCollapsedRow note indicator', () => {
  it('shows a note icon with the note as its label when a note exists', () => {
    renderRow({ ...baseRow, note: 'Seemed fine.' })
    expect(screen.getByLabelText('Seemed fine.')).toBeInTheDocument()
  })

  it('truncates a long note to 60 chars plus an ellipsis', () => {
    const long = 'x'.repeat(80)
    renderRow({ ...baseRow, note: long })
    const expected = `${'x'.repeat(60)}…`
    expect(screen.getByLabelText(expected)).toBeInTheDocument()
  })

  it('renders no note icon when there is no note', () => {
    renderRow(baseRow)
    expect(screen.queryByTestId('note-indicator')).toBeNull()
  })
})
