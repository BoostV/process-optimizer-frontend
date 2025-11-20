import { PNGPlot, ParetoFrontPlot } from '.'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { singlePng, paretoJson } from './demo-data'

// cast the dummy data. Real data will be zod parsed
const pareto = paretoJson as unknown as Parameters<
  typeof ParetoFrontPlot
>[0]['plot']

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ParetoFrontPlot plot={pareto} />
    <PNGPlot plot={singlePng} />
  </React.StrictMode>
)
