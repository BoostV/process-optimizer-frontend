import { useLocalStorageReducer } from './useLocalStorageReducer'
import { renderHook } from '@testing-library/react'
import { initialState, State } from '../store'
import { Action } from '../reducers/reducers'

describe('useLocalStorageReducer', () => {
  it('can be called once', () => {
    const reducer = (state: State, _action: Action) => state
    const { result } = renderHook(() =>
      useLocalStorageReducer(reducer, initialState)
    )
    expect(result.current[0]).toEqual(initialState)
  })

  it('can be called twice', () => {
    localStorage.removeItem('321')
    const reducer = (state: State, _action: Action) => state
    const { result: result1 } = renderHook(() =>
      useLocalStorageReducer(reducer, initialState)
    )
    const { result: result2 } = renderHook(() =>
      useLocalStorageReducer(
        reducer,
        {
          ...initialState,
          experiment: { ...initialState.experiment, id: '321' },
        },
        '321'
      )
    )
    expect(result1.current[0]).toEqual(initialState)
    expect(result2.current[0].experiment.id).toEqual('321')
  })
})
