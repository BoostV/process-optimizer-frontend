import { ThemeProvider } from "@material-ui/core"
import { AppProps } from "next/dist/next-server/lib/router/router"
import { theme } from "../theme/theme"

function App({ Component, pageProps }: AppProps) {
  return <ThemeProvider theme={theme}><Component {...pageProps} /></ThemeProvider>
}

export default App