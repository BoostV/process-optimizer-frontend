import { ApiProvider } from '@core/context/experiment/api-provider'
import { renderHook } from '@testing-library/react'
import { FC } from 'react'
import { vi } from 'vitest'
import {
  useExperiment,
  ExperimentProvider,
  useSelector,
} from './experiment-context'
import { State } from './store'

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
