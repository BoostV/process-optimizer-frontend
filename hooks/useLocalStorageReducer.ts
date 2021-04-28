import { useCallback, useReducer } from 'react'
import { Action } from '../reducers/reducers'
import { State } from '../store'

const init = (localStorageKey: string) => (initialState: State) => {
    try {
        const locallyStoredState = localStorage.getItem(localStorageKey)
        if (locallyStoredState !== null) {
            return JSON.parse(locallyStoredState)
          } else {
            localStorage.setItem(localStorageKey, JSON.stringify(initialState))
          }
    } catch (error) {
        // Incognito mode might cause loding to fail - add error message to initial state and continue
        return initialState
        // return {...initialState,
        //     errors: {...initialState.errors, 
        //         loadingError: `Error loading state from local storage ${error}`
        //     }
        // }
    }
    return initialState
}

export const useLocalStorageReducer = (reducer: (state: State, action: Action) => State, initialState: State, localStorageKey: string = "rootState") => {
    const localStorageReducer = useCallback(
        (state: State, action: Action) => {
            const newState = reducer(state, action)
            try {
                localStorage.setItem(localStorageKey, JSON.stringify(newState))
              } catch (error) {
                  return newState
                // return {...initialState,
                //     errors: {...initialState.errors, 
                //         loadingError: `Error loading state from local storage ${error}`
                //     }
                // }
              }
            return newState
        },
        [localStorageKey]
    )

    return useReducer(localStorageReducer, initialState, init(localStorageKey))
}