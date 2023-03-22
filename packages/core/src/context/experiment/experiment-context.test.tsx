import { ApiProvider } from '@core/context/experiment/api-provider'
import { render, renderHook, screen } from '@testing-library/react'
import { FC } from 'react'
import { it, vi } from 'vitest'
import {
  useExperiment,
  ExperimentProvider,
  useSelector,
} from './experiment-context'
import { State } from './store'

import catapult from '../../../sample-data/catapult.json' assert { type: 'json' }
import { ExperimentType } from '@core/common'

const ExperimentWrapper: FC<{ children: React.ReactNode }> = ({ children }) => (
  <ApiProvider>
    <ExperimentProvider experimentId="123">{children}</ExperimentProvider>
  </ApiProvider>
)

describe('useExperiment', () => {
  it('fails if called outside provider', async () => {
    console.error = vi.fn()
    expect(() => renderHook(() => useExperiment())).toThrow(
      'useExperiment must be used within an ExperimentProvider'
    )
    expect(console.error).toHaveBeenCalled()
  })

  it('provides context when called inside provider', async () => {
    const { result } = renderHook(() => useExperiment(), {
      wrapper: ExperimentWrapper,
    })
    expect(result.current.state.experiment.id).toMatch(/123/)
  })
})

describe('useSelector', () => {
  it('should bind selector to state', () => {
    const testSelector = (state: State) => state.experiment.id
    const { result } = renderHook(() => useSelector(testSelector), {
      wrapper: ExperimentWrapper,
    })
    expect(result.current).toEqual('123')
  })
})

describe('Pluggable storage', () => {
  afterEach(() => localStorage.clear())
  const Tester = () => {
    const { state, loading } = useExperiment()
    return (
      <pre>
        {loading ? 'loading' : 'done'}
        {JSON.stringify(state.experiment, undefined, 2)}
      </pre>
    )
  }

  it('should read from localStorage when no storage provider is assigned', async () => {
    const localCatapult: State = {
      experiment: JSON.parse(JSON.stringify(catapult)),
    }
    localCatapult.experiment.info.name = 'I am stored in localStorage'
    localCatapult.experiment.id = 'catapult'
    localStorage.setItem('catapult', JSON.stringify(localCatapult))
    render(
      <ApiProvider>
        <ExperimentProvider experimentId="catapult">
          <Tester />
        </ExperimentProvider>
      </ApiProvider>
    )
    const experimentId = await screen.findAllByText(/catapult/)
    const experimentName = await screen.findAllByText(
      /I am stored in localStorage/
    )
    expect(experimentId).not.toBeNull()
    expect(experimentName).not.toBeNull()
  })

  it('should read from provided storage when such provider is assigned', async () => {
    const localCatapult: State = {
      experiment: JSON.parse(JSON.stringify(catapult)),
    }
    localCatapult.experiment.info.name = 'I am stored in storage provider'
    localCatapult.experiment.id = 'catapult'
    render(
      <ApiProvider>
        <ExperimentProvider experimentId="catapult">
          <Tester />
        </ExperimentProvider>
      </ApiProvider>
    )
    const experimentId = await screen.findAllByText(/catapult/)
    const experimentName = await screen.findAllByText(
      /I am stored in storage provider/
    )
    expect(experimentId).not.toBeNull()
    expect(experimentName).not.toBeNull()
  })
})
