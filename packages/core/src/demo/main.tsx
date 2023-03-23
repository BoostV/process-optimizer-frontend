import { ApiProvider } from '@boostv/process-optimizer-frontend-core'
import React from 'react'
import ReactDOM from 'react-dom/client'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ApiProvider>Hello</ApiProvider>
  </React.StrictMode>
)
