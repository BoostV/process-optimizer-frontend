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
      label: 'Quality (0-5)',
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
    // objective header uses the human-facing label, not the internal name
    // ("quality"). It appears both as the score column header and the RESPONSE
    // section label, hence getAllByText.
    expect(screen.getAllByText('Quality (0-5)').length).toBeGreaterThanOrEqual(
      2
    )
    expect(screen.getByLabelText('Weight')).toHaveValue(150)
    expect(screen.getByLabelText('Viscosity')).toBeInTheDocument()
  })

  it('omits an objective (and the whole section) when it has no response vars', () => {
    const factorOnlyRow: TableDataRow = {
      isNew: false,
      metaId: 3,
      enabled: true,
      valid: true,
      dataPoints: [{ name: 'cost', label: 'Cost', value: '3', type: 'rating' }],
      scoreFunctions: [
        {
          scoreName: 'cost',
          label: 'Cost',
          hasFunction: true,
          useFunction: true,
          responseVars: [], // only factors -> no response inputs
          values: {},
        },
      ],
    }
    render(
      <table>
        <tbody>
          <EditableTableExpandedRow
            colSpan={3}
            rowId={3}
            tableRow={factorOnlyRow}
            setExpanded={() => {}}
            onAdd={() => {}}
            onSave={() => {}}
          />
        </tbody>
      </table>
    )
    // no "Response" header and no "Cost" objective row in the response section
    expect(screen.queryByText('Response')).toBeNull()
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
