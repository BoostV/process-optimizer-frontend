import { useReducer } from 'react'

const init = (localStorageKey: string) => <S> (initialState: S) => {
  try {
    const locallyStoredState = localStorage.getItem(localStorageKey)
    if (locallyStoredState !== null) {
      console.log(`Found data in ${localStorageKey}`)
      const state = JSON.parse(locallyStoredState)
      return {...initialState, ...state}
    } else {
      localStorage.setItem(localStorageKey, JSON.stringify(initialState))
    }
  } catch (error) {
    // Incognito mode might cause loading to fail - add error message to initial state and continue
  }
  return initialState
}

export const useLocalStorageReducer = <S, A> (reducer: (state: S, action: A) => S, initialState: S, localStorageKey: string = "rootState") => {
  const localStorageReducer = (state: S, action: A) => {
    const newState = reducer(state, action)
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(newState))
    } catch {
      console.log(`Unable to use local storage`)
    }
    return newState
  }
  return useReducer(localStorageReducer, initialState, init(localStorageKey))
}