import { PNGPlot, ParetoFrontPlot } from '.'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { singlePng, paretoJson } from './demo-data'
import { OneDPlot } from './one-d-plot/one-d-plot'

// cast the dummy data. Real data will be zod parsed
const pareto = paretoJson as unknown as Parameters<
  typeof ParetoFrontPlot
>[0]['plot']

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ParetoFrontPlot plot={pareto} />
    <PNGPlot plot={singlePng} />
    <div style={{ display: 'flex' }}>
      <OneDPlot
        data={[
          { x: 1, y: 2 },
          { x: 2, y: 3 },
          { x: 3, y: 5 },
          { x: 4, y: 3 },
          { x: 5, y: 1 },
        ]}
        height={'140px'}
        width={'140px'}
        type="score"
      />
      <OneDPlot
        data={[
          { x: 1, y: [4, 2] },
          { x: 2, y: [2, 6] },
          { x: 3, y: [3, 5] },
          { x: 4, y: [4, 7] },
          { x: 5, y: [10, 11] },
        ]}
        height={'140px'}
        width={'140px'}
        referenceLineX={3}
      />
    </div>
  </React.StrictMode>
)
