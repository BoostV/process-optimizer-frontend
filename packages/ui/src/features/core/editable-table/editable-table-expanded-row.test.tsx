import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { EditableTableExpandedRow } from './editable-table-expanded-row'
import type { TableDataRow } from './types'

afterEach(() => cleanup())

const row: TableDataRow = {
  isNew: false,
  metaId: 2,
  enabled: true,
  valid: true,
  dataPoints: [
    { name: 'quality', label: 'Quality (0-5)', value: '2.5', type: 'rating' },
  ],
  scoreFunctions: [
    {
      scoreName: 'quality',
      hasFunction: true,
      useFunction: true,
      responseVars: [
        { symbol: 'weight', name: 'Weight' },
        { symbol: 'viscosity', name: 'Viscosity' },
      ],
      values: { weight: '150' },
    },
  ],
}

describe('EditableTableExpandedRow RESPONSE section', () => {
  it('renders response inputs for a function objective', () => {
    render(
      <table>
        <tbody>
          <EditableTableExpandedRow
            colSpan={3}
            rowId={2}
            tableRow={row}
            setExpanded={() => {}}
            onAdd={() => {}}
            onSave={() => {}}
          />
        </tbody>
      </table>
    )
    expect(screen.getByText('Response')).toBeInTheDocument()
    expect(screen.getByLabelText('Weight')).toHaveValue(150)
    expect(screen.getByLabelText('Viscosity')).toBeInTheDocument()
  })

  it('lets a modified row be saved even when a violation is present (no deadlock)', () => {
    render(
      <table>
        <tbody>
          <EditableTableExpandedRow
            colSpan={3}
            rowId={2}
            tableRow={row}
            setExpanded={() => {}}
            onAdd={() => {}}
            onSave={() => {}}
            violations={[
              'All responses must be defined to use the quality function.',
            ]}
          />
        </tbody>
      </table>
    )
    const save = screen.getByRole('button', { name: /save/i })
    // untouched row: nothing to save yet
    expect(save).toBeDisabled()
    // editing a response (the very thing that would clear the violation) must
    // re-enable Save despite the violation still being present
    fireEvent.change(screen.getByLabelText('Weight'), {
      target: { value: '3' },
    })
    expect(save).toBeEnabled()
  })

  it('shows the missing-response violation via InfoBox', () => {
    render(
      <table>
        <tbody>
          <EditableTableExpandedRow
            colSpan={3}
            rowId={2}
            tableRow={row}
            setExpanded={() => {}}
            onAdd={() => {}}
            onSave={() => {}}
            violations={[
              'All responses must be defined to use the quality function.',
            ]}
          />
        </tbody>
      </table>
    )
    expect(
      screen.getByText(
        'All responses must be defined to use the quality function.'
      )
    ).toBeInTheDocument()
  })
})
