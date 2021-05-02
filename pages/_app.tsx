import { ThemeProvider } from "@material-ui/core"
import { AppProps } from "next/dist/next-server/lib/router/router"
import { useEffect } from "react"
import { theme } from "../theme/theme"
import Head from 'next/head'
import CssBaseline from '@material-ui/core/CssBaseline'
import { GlobalStateProvider } from "../context/global-context"

function SafeHydrate({ children }) {
  return (
    <div suppressHydrationWarning>
      {typeof window === 'undefined' ? null : children}
    </div>
  )
}

function App({ Component, pageProps }: AppProps) {
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
        <title>My page</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <GlobalStateProvider>
          <Component {...pageProps} />
        </GlobalStateProvider>
      </ThemeProvider>
    </SafeHydrate>
  )
}

export default App