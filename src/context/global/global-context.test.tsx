import { renderHook } from '@testing-library/react'
import { FC } from 'react'
import { State } from '@/context/global'
import { GlobalStateProvider, useGlobal, useSelector } from '@/context/global'

const GlobalWrapper: FC<{ children: React.ReactNode }> = ({ children }) => (
  <GlobalStateProvider>{children}</GlobalStateProvider>
)

describe('useGlobal', () => {
  it('fails if called outside provider', async () => {
    console.error = jest.fn()
    expect(() => renderHook(() => useGlobal())).toThrow(
      'useGlobal must be used within a GlobalStateProvider'
    )
    expect(console.error).toHaveBeenCalled()
  })

  it('provides context when called inside provider', async () => {
    const { result } = renderHook(() => useGlobal(), {
      wrapper: GlobalWrapper,
    })
    expect(result.current.state.debug).toBeFalsy()
  })
})

describe('useSelector', () => {
  it('should bind selector to state', () => {
    const testSelector = (state: State) => state.debug
    const { result } = renderHook(() => useSelector(testSelector), {
      wrapper: GlobalWrapper,
    })
    expect(result.current).toBeFalsy
  })
})
