import { Theme, ThemeProvider } from '@mui/material'
import * as React from 'react'
import ThemeSelector from '@/components/theme-selector/theme-selector'
import { useLocalStorageReducer } from '@/hooks/useLocalStorageReducer'
import { State, Dispatch, initialState, reducer } from './global-reducer'
import { theme, themes, CustomTheme } from '@/theme/theme'

const GlobalContext = React.createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined)

interface GlobalStateProviderProps {
  children: React.ReactNode
}

export function GlobalStateProvider({ children }: GlobalStateProviderProps) {
  const [state, dispatch] = useLocalStorageReducer(
    reducer,
    initialState,
    'global'
  )

  const loadTheme = (): Theme => {
    const themeToLoad: CustomTheme | undefined = themes.find(
      t => t.name === state.theme
    )
    return themeToLoad ? { ...themeToLoad.theme } : { ...theme }
  }

  /**
   * Disable server side rendering for the main component
   * The following snippet is based on these resources:
   * https://nextjs.org/docs/messages/react-hydration-error
   * https://www.joshwcomeau.com/react/the-perils-of-rehydration/
   */
  const [hasMounted, setHasMounted] = React.useState(false)
  React.useEffect(() => {
    setHasMounted(true)
  }, [])
  if (!hasMounted) {
    return null
  }

  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      <ThemeProvider theme={loadTheme()}>
        {children}
        <ThemeSelector />
      </ThemeProvider>
    </GlobalContext.Provider>
  )
}

export function useGlobal() {
  const context = React.useContext(GlobalContext)
  if (context === undefined) {
    throw new Error('useGlobal must be used within a GlobalStateProvider')
  }
  return context
}

export const useSelector = <T,>(selector: (state: State) => T) => {
  const context = React.useContext(GlobalContext)
  if (context === undefined) {
    throw new Error('useSelector must be used within an GlobalStateProvider')
  }
  return selector(context.state)
}
