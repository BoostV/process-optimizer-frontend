import * as React from 'react'
import { useLocalStorageReducer } from '../hooks/useLocalStorageReducer'
import { State, Dispatch, initialState, reducer } from '../reducers/global-reducer'

const GlobalContext = React.createContext<{state: State, dispatch: Dispatch} | undefined>(undefined)

function GlobalStateProvider({children}) {
    const [state, dispatch] = useLocalStorageReducer(reducer, initialState, 'global')
    return <GlobalContext.Provider value={{state, dispatch}}>{children}</GlobalContext.Provider>
}

function useGlobal() {
    const context = React.useContext(GlobalContext)
    if (context === undefined) {
        throw new Error('useGlobal must be used within a GlobalStateProvider')
    }
    return context
}

export {GlobalStateProvider, useGlobal}