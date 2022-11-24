import CssBaseline from '@mui/material/CssBaseline'
import { GlobalStateProvider } from '@/context/global'
import ExperimentContainer from './experiment-container'
import createEmotionCache from './createEmotionCache'
import { CacheProvider } from '@emotion/react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from '@/components/home/home'

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

export default function MyApp() {
  return (
    <CacheProvider value={emotionCache}>
      <GlobalStateProvider>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <RouterProvider router={router} />
      </GlobalStateProvider>
    </CacheProvider>
  )
}
