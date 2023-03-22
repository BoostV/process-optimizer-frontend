import { useLocalStorageReducer } from '@core/storage'
import { initialState, State } from '@core/context/experiment'
import { renderHook } from '@testing-library/react'

describe('useLocalStorageReducer', () => {
  it('can be called once', () => {
    const reducer = (state: State) => state
    const { result } = renderHook(() =>
      useLocalStorageReducer(reducer, initialState)
    )
    expect(result.current[0]).toEqual(initialState)
  })

  it('can be called twice', () => {
    localStorage.removeItem('321')
    const reducer = (state: State) => state
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

  it('can use another storage backend', () => {
    const storage: typeof localStorage = {
      ...localStorage,
      getItem: () => {
        return JSON.stringify({
          experiment: { ...initialState.experiment, id: 'test' },
        })
      },
    }
    const reducer = (state: State) => state
    const { result } = renderHook(() =>
      useLocalStorageReducer(
        reducer,
        initialState,
        'rootState',
        x => x,
        storage
      )
    )
    const {
      experiment: { id },
    } = result.current[0]
    expect(id).toEqual('test')
  })
})
