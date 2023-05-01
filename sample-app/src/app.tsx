import CssBaseline from '@mui/material/CssBaseline'
import { GlobalStateProvider } from '@sample/context/global'
import ExperimentContainer from './experiment-container'
import createEmotionCache from './createEmotionCache'
import { CacheProvider } from '@emotion/react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from '@sample/components/home/home'
import { ApiProvider } from '@boostv/process-optimizer-frontend-core'
import { enableMapSet } from 'immer'

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Home />,
    },
    {
      path: 'experiment/:experimentId',
      element: <ExperimentContainer />,
    },
  ],
  { basename: import.meta.env.BASE_URL }
)
// <ExperimentContainer experimentId="4b1e207a-85e5-4800-b4f3-cfeb21338798" />
const emotionCache = createEmotionCache()
enableMapSet() //immer setup

const apiConfig = {
  basePath: import.meta.env.VITE_PUBLIC_API_SERVER,
  apiKey: 'none',
}

export default function MyApp() {
  return (
    <CacheProvider value={emotionCache}>
      <GlobalStateProvider>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <ApiProvider config={apiConfig}>
          <RouterProvider router={router} />
        </ApiProvider>
      </GlobalStateProvider>
    </CacheProvider>
  )
}
