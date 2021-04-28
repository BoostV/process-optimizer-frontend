import { ThemeProvider } from "@material-ui/core"
import { AppProps } from "next/dist/next-server/lib/router/router"
import { useEffect } from "react";
import { theme } from "../theme/theme"

function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, [])
  return <ThemeProvider theme={theme}><Component {...pageProps} /></ThemeProvider>
}

export default App