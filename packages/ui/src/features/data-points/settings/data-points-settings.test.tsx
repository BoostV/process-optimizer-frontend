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
            {
              type: 'discrete',
              name: 'Pin elevation',
              description: '',
              min: 0,
              max: 200,
              enabled: false, // disabled, but still used by the quality function
            },
          ],
          categoricalVariables: [],
          scoreVariables: [
            {
              name: 'quality',
              label: 'Quality (0-5)',
              description: '',
              enabled: true,
              scoreFunction: {
                expression: 'resp1/5 + pinElevation',
                variables: [
                  { name: 'Resp1', symbol: 'resp1', source: 'response' },
                  {
                    name: 'Pin elevation',
                    symbol: 'pinElevation',
                    source: 'factor',
                    factorName: 'Pin elevation',
                  },
                ],
              },
            },
            { name: 'cost', label: 'Cost', description: '', enabled: true },
          ],
          dataPoints: [
            {
              meta: { id: 1 },
              data: [],
              responses: [
                {
                  scoreName: 'quality',
                  useFunction: false,
                  values: [{ symbol: 'resp1', value: 3 }],
                },
              ],
            },
            { meta: { id: 2 }, data: [], responses: [] },
            { meta: { id: 3 }, data: [], responses: undefined },
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
    fireEvent.change(screen.getByRole('textbox', { name: /score function/i }), {
      target: { value: 'firingAngle/100' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'updateScoreFunction' })
    )
  })

  it('keeps a clicked factor in scoreFunction.variables (not just the expression)', () => {
    render(<DataPointsSettings onCancel={() => {}} onSave={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /firing angle/i }))
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    const call = dispatch.mock.calls.find(
      c =>
        c[0].type === 'updateScoreFunction' &&
        c[0].payload.scoreName === 'quality'
    )
    const sf = call?.[0].payload.scoreFunction
    expect(sf.expression).toContain('firingAngle')
    expect(sf.variables).toContainEqual(
      expect.objectContaining({
        symbol: 'firingAngle',
        source: 'factor',
        factorName: 'Firing angle',
      })
    )
  })

  it('opens the help dialog when the help icon is clicked', () => {
    render(<DataPointsSettings onCancel={() => {}} onSave={() => {}} />)
    expect(screen.queryByText('How score functions work')).toBeNull()
    fireEvent.click(
      screen.getByRole('button', { name: /score function help/i })
    )
    expect(screen.getByText('How score functions work')).toBeInTheDocument()
  })

  it('disables Save when the active expression fails to parse', () => {
    render(<DataPointsSettings onCancel={() => {}} onSave={() => {}} />)
    fireEvent.change(screen.getByRole('textbox', { name: /score function/i }), {
      target: { value: 'firingAngle/' },
    })
    const saveButton = screen.getByRole('button', { name: /^save$/i })
    expect(saveButton).toBeDisabled()
    fireEvent.click(saveButton)
    expect(dispatch).not.toHaveBeenCalled()
  })

  it('renders the "For existing data points" toggle group defaulted to Leave unchanged', () => {
    render(<DataPointsSettings onCancel={() => {}} onSave={() => {}} />)
    expect(screen.getByText('For existing data points')).toBeInTheDocument()
    const unchanged = screen.getByRole('button', { name: /leave unchanged/i })
    const enable = screen.getByRole('button', { name: /use for all/i })
    const disable = screen.getByRole('button', {
      name: /turn off for all/i,
    })
    expect(unchanged).toBeInTheDocument()
    expect(enable).toBeInTheDocument()
    expect(disable).toBeInTheDocument()
    expect(unchanged).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows the missing-responses warning when "Use for all" is selected', () => {
    render(<DataPointsSettings onCancel={() => {}} onSave={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /use for all/i }))
    expect(
      screen.getByText(
        '2 of 3 points are missing responses and will be marked invalid. Adding responses after saving will make them valid again.'
      )
    ).toBeInTheDocument()
  })

  it('dispatches setDataPointsUseFunction on save when "Use for all" is selected', () => {
    render(<DataPointsSettings onCancel={() => {}} onSave={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /use for all/i }))
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'updateScoreFunction' })
    )
    expect(dispatch).toHaveBeenCalledWith({
      type: 'setDataPointsUseFunction',
      payload: { scoreName: 'quality', useFunction: true },
    })
  })

  it('does not dispatch setDataPointsUseFunction on save when left unchanged', () => {
    render(<DataPointsSettings onCancel={() => {}} onSave={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'setDataPointsUseFunction' })
    )
  })

  it('warns when the function uses a disabled or removed factor', () => {
    render(<DataPointsSettings onCancel={() => {}} onSave={() => {}} />)
    // quality tab's saved function uses "Pin elevation", which is disabled
    expect(
      screen.getByText(/disabled or removed factor:.*Pin elevation/)
    ).toBeInTheDocument()
  })

  it('shows an undefined-symbol warning when the expression references an undeclared symbol', () => {
    render(<DataPointsSettings onCancel={() => {}} onSave={() => {}} />)
    fireEvent.change(screen.getByRole('textbox', { name: /score function/i }), {
      target: { value: 'a + resp1' },
    })
    expect(screen.getByText(/Unknown variables:.*\ba\b/)).toBeInTheDocument()
  })

  it('disables "Use for all"/"Turn off for all" when the active draft has no usable expression', () => {
    render(<DataPointsSettings onCancel={() => {}} onSave={() => {}} />)
    // Switch to the "cost" tab, which has no saved/draft score function.
    fireEvent.click(screen.getByRole('tab', { name: /cost/i }))
    expect(screen.getByRole('button', { name: /use for all/i })).toBeDisabled()
    expect(
      screen.getByRole('button', { name: /turn off for all/i })
    ).toBeDisabled()
  })
})
