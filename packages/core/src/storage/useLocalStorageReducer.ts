import { useReducer } from 'react'

const init =
  (localStorageKey: string, storage: typeof localStorage = localStorage) =>
  <S>(initialState: S) => {
    try {
      const locallyStoredState = storage.getItem(localStorageKey)
      if (locallyStoredState !== null) {
        console.log(`Found data in ${localStorageKey}`)
        const state = JSON.parse(locallyStoredState)
        return { ...initialState, ...state }
      } else {
        storage.setItem(localStorageKey, JSON.stringify(initialState))
      }
    } catch (error) {
      // Incognito mode might cause loading to fail - add error message to initial state and continue
    }
    return initialState
  }

export const useLocalStorageReducer = <S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S,
  localStorageKey = 'rootState',
  transform = (x: S) => x,
  storage: typeof localStorage = localStorage
) => {
  const localStorageReducer = (state: S, action: A) => {
    const newState = reducer(state, action)
    try {
      storage.setItem(localStorageKey, JSON.stringify(newState))
    } catch {
      console.log(`Unable to use local storage`)
    }
    return newState
  }
  return useReducer(localStorageReducer, initialState, s =>
    transform(init(localStorageKey)(s))
  )
}
