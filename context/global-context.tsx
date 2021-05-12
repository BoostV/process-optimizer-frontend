import { Theme, ThemeProvider } from "@material-ui/core"
import * as React from 'react'
import ThemeSelector from "../components/theme-selector"
import { useLocalStorageReducer } from '../hooks/useLocalStorageReducer'
import { State, Dispatch, initialState, reducer } from '../reducers/global-reducer'
import { theme, themes, CustomTheme } from "../theme/theme";

const GlobalContext = React.createContext<{state: State, dispatch: Dispatch} | undefined>(undefined)

function GlobalStateProvider({children}) {
    const [state, dispatch] = useLocalStorageReducer(reducer, initialState, 'global')

    const loadTheme = (): Theme => {
        const themeToLoad: CustomTheme | undefined = themes.find(t => t.name === state.theme)
        return themeToLoad ? {...themeToLoad.theme} : {...theme}
    }

    return ( 
        <GlobalContext.Provider value={{state, dispatch}}>
            <ThemeProvider theme={loadTheme()}>
                {children}
                <ThemeSelector/>
            </ThemeProvider>
        </GlobalContext.Provider>
    )
}

function useGlobal() {
    const context = React.useContext(GlobalContext)
    if (context === undefined) {
        throw new Error('useGlobal must be used within a GlobalStateProvider')
    }
    return context
}

export {GlobalStateProvider, useGlobal}