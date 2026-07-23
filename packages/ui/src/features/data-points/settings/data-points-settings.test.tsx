import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { DataPointsSettings } from './data-points-settings'

// Minimal experiment-context mock exposing quality + cost score variables and a
// spy dispatch.
const dispatch = vi.fn()
vi.mock('@boostv/process-optimizer-frontend-core', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useExperiment: () => ({
      state: {
        experiment: {
          valueVariables: [
            {
              type: 'discrete',
              name: 'Firing angle',
              description: '',
              min: 90,
              max: 140,
              enabled: true,
            },
          ],
          categoricalVariables: [],
          scoreVariables: [
            {
              name: 'quality',
              label: 'Quality (0-5)',
              description: '',
              enabled: true,
            },
            { name: 'cost', label: 'Cost', description: '', enabled: true },
          ],
        },
      },
      dispatch,
    }),
    useSelector: () => true, // isMultiObjective
  }
})

afterEach(() => {
  cleanup()
  dispatch.mockClear()
})

describe('DataPointsSettings', () => {
  it('renders a tab per objective and a factor button', () => {
    render(<DataPointsSettings onCancel={() => {}} onSave={() => {}} />)
    expect(screen.getByRole('tab', { name: /quality/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /cost/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /firing angle/i })
    ).toBeInTheDocument()
  })

  it('dispatches updateScoreFunction on save', () => {
    render(<DataPointsSettings onCancel={() => {}} onSave={() => {}} />)
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'firingAngle/100' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'updateScoreFunction' })
    )
  })

  it('disables Save when the active expression fails to parse', () => {
    render(<DataPointsSettings onCancel={() => {}} onSave={() => {}} />)
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'firingAngle/' },
    })
    const saveButton = screen.getByRole('button', { name: /^save$/i })
    expect(saveButton).toBeDisabled()
    fireEvent.click(saveButton)
    expect(dispatch).not.toHaveBeenCalled()
  })
})
