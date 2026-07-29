import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { DataPointsSettings } from './data-points-settings'

// Separate module-level mock (distinct from data-points-settings.test.tsx) so
// we can exercise the "no data points" case without touching the fixed
// experiment used by the other suite's vi.mock.
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
          dataPoints: [],
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

describe('DataPointsSettings with no data points', () => {
  it('hides the "For existing data points" section', () => {
    render(<DataPointsSettings onCancel={() => {}} onSave={() => {}} />)
    expect(screen.queryByText('For existing data points')).toBeNull()
  })
})
