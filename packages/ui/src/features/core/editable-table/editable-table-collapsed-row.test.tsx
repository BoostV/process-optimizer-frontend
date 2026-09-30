import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
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

const renderRow = (
  tableRow: TableDataRow,
  onNoteChanged: (note: string | undefined) => void = () => {}
) =>
  render(
    <table>
      <tbody>
        <EditableTableCollapsedRow
          colSpan={4}
          rowId={1}
          tableRow={tableRow}
          setExpanded={() => {}}
          onEnabledToggled={() => {}}
          onNoteChanged={onNoteChanged}
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
    expect(
      screen.getByRole('button', { name: 'Seemed fine.' })
    ).toBeInTheDocument()
  })

  it('truncates a long note to 100 chars plus an ellipsis', () => {
    const long = 'x'.repeat(120)
    renderRow({ ...baseRow, note: long })
    const expected = `${'x'.repeat(100)}…`
    expect(screen.getByRole('button', { name: expected })).toBeInTheDocument()
  })

  it('renders no note icon when there is no note', () => {
    renderRow(baseRow)
    expect(screen.queryByTestId('note-indicator')).toBeNull()
  })
})

describe('EditableTableCollapsedRow note popover', () => {
  const openPopover = (note = 'first note') => {
    const onNoteChanged = vi.fn()
    renderRow({ ...baseRow, note }, onNoteChanged)
    fireEvent.click(screen.getByTestId('note-indicator'))
    return onNoteChanged
  }

  it('opens a popover prefilled with the note when the icon is clicked', () => {
    openPopover('I pressed the red button.')
    expect(screen.getByRole('textbox', { name: 'Edit note' })).toHaveValue(
      'I pressed the red button.'
    )
  })

  it('saves the edited note via onNoteChanged', () => {
    const onNoteChanged = openPopover('old')
    fireEvent.change(screen.getByRole('textbox', { name: 'Edit note' }), {
      target: { value: 'updated note' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save note' }))
    expect(onNoteChanged).toHaveBeenCalledWith('updated note')
  })

  it('deletes the note via onNoteChanged(undefined)', () => {
    const onNoteChanged = openPopover('to be deleted')
    fireEvent.click(screen.getByRole('button', { name: 'Delete note' }))
    expect(onNoteChanged).toHaveBeenCalledWith(undefined)
  })

  it('cancels without calling onNoteChanged and closes the popover', () => {
    const onNoteChanged = openPopover('unchanged')
    fireEvent.click(screen.getByRole('button', { name: 'Cancel note' }))
    expect(onNoteChanged).not.toHaveBeenCalled()
    expect(screen.queryByRole('textbox', { name: 'Edit note' })).toBeNull()
  })
})
