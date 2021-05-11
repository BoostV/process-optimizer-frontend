import { ThemeProvider, Theme, Box, Button } from "@material-ui/core"
import { AppProps } from "next/dist/next-server/lib/router/router"
import { useEffect, useState } from "react"
import { beeTheme, beeLightTheme, cyanTheme, tealTheme, theme, woodTheme, blueGreenTheme, honeyTheme, earthTheme } from "../theme/theme"
import Head from 'next/head'
import CssBaseline from '@material-ui/core/CssBaseline'
import { GlobalStateProvider } from "../context/global-context"
import useStyles from "../styles/app.style"

function SafeHydrate({ children }) {
  return (
    <div suppressHydrationWarning>
      {typeof window === 'undefined' ? null : children}
    </div>
  )
}

function App({ Component, pageProps }: AppProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(theme)
  const classes = useStyles()

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, [])
  return (
    <SafeHydrate>
      <Head>
        <title>BrownieBee</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        <GlobalStateProvider>
          <Component {...pageProps} />
          <Box className={classes.themeContainer}>
            <Button size="small" onClick={() => setCurrentTheme({...tealTheme})}>Teal</Button>
            <Button size="small" onClick={() => setCurrentTheme({...cyanTheme})}>Cyan</Button>
            <Button size="small" onClick={() => setCurrentTheme({...beeTheme})}>Bee</Button>
            <Button size="small" onClick={() => setCurrentTheme({...beeLightTheme})}>BeeLight</Button>
            <Button size="small" onClick={() => setCurrentTheme({...woodTheme})}>Wood</Button>
            <Button size="small" onClick={() => setCurrentTheme({...blueGreenTheme})}>BlueGreen</Button>
            <Button size="small" onClick={() => setCurrentTheme({...honeyTheme})}>Honey</Button>
            <Button size="small" onClick={() => setCurrentTheme({...earthTheme})}>Earth</Button>
          </Box>  
        </GlobalStateProvider>
      </ThemeProvider>
    </SafeHydrate>
  )
}

export default App