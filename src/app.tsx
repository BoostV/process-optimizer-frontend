import * as React from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { GlobalStateProvider } from '@/context/global'
import ExperimentContainer from './experiment-container'
import createEmotionCache from './createEmotionCache'
import { CacheProvider } from '@emotion/react'
import Home from '@/components/home/home'

const emotionCache = createEmotionCache()

export default function MyApp() {
  return (
    <CacheProvider value={emotionCache}>
      <GlobalStateProvider>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <Home />
        <ExperimentContainer experimentId="4b1e207a-85e5-4800-b4f3-cfeb21338798" />
      </GlobalStateProvider>
    </CacheProvider>
  )
}
