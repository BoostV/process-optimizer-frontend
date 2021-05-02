import * as React from 'react'

type GlobalState = {}
type Dispatch = {}
const GlobalContext = React.createContext<{state: GlobalState, dispatch: Dispatch} | undefined>(undefined)

function globalReducer(state, action) {
    return {...state}
}

function GlobalStateProvider({children}) {
    const [state, dispatch] = React.useReducer(globalReducer, {})

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