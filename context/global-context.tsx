import { Theme, ThemeProvider } from "@material-ui/core"
import * as React from 'react'
import ThemeSelector from "../components/theme-selector"
import { useLocalStorageReducer } from '../hooks/useLocalStorageReducer'
import { State, Dispatch, initialState, reducer } from '../reducers/global-reducer'
import { beeLightTheme, beeTheme, blueGreenTheme, cyanTheme, earthTheme, honeyTheme, tealTheme, woodTheme } from '../theme/theme'

const GlobalContext = React.createContext<{state: State, dispatch: Dispatch} | undefined>(undefined)

function GlobalStateProvider({children}) {
    const [state, dispatch] = useLocalStorageReducer(reducer, initialState, 'global')

    const loadTheme = (): Theme => {
        switch(state.theme) {
            case "blueGreenTheme":
                return {...blueGreenTheme}
            case "tealTheme":
                return {...tealTheme}
            case "cyanTheme":
                return {...cyanTheme}
            case "beeTheme":
                return {...beeTheme}
            case "beeLightTheme":
                return {...beeLightTheme}
            case "woodTheme":
                return {...woodTheme}
            case "honeyTheme":
                return {...honeyTheme}
            case "earthTheme":
                return {...earthTheme}
            default:
                return {...blueGreenTheme}
        }
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