import { ApiProvider } from '@boostv/process-optimizer-frontend-core'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ExperimentView } from './experiment-view'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ApiProvider>
      <ExperimentView />
    </ApiProvider>
  </React.StrictMode>
)
