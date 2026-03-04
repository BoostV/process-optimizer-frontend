import { PNGPlot, ParetoFrontPlot } from '.'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { singlePng, paretoJson } from './demo-data'
import { OneDPlot } from './one-d-plot/one-d-plot'
import { DataEntry } from '@boostv/process-optimizer-frontend-core'

// cast the dummy data. Real data will be zod parsed
const pareto = paretoJson as unknown as Parameters<
  typeof ParetoFrontPlot
>[0]['plot']

const dummyDataPoints: DataEntry[] = [
  {
    meta: {
      id: 1,
      enabled: true,
      valid: true,
    },
    data: [
      {
        type: 'numeric',
        name: 'A',
        value: 130,
      },
      {
        type: 'numeric',
        name: 'B',
        value: 155,
      },
      {
        type: 'categorical',
        name: 'C',
        value: 'Red',
      },
      {
        type: 'score',
        name: 'quality',
        value: 2,
      },
      {
        type: 'score',
        name: 'cost',
        value: 3,
      },
    ],
  },
  {
    meta: {
      id: 2,
      enabled: true,
      valid: true,
    },
    data: [
      {
        type: 'numeric',
        name: 'A',
        value: 190,
      },
      {
        type: 'numeric',
        name: 'B',
        value: 125,
      },
      {
        type: 'categorical',
        name: 'C',
        value: 'Red',
      },
      {
        type: 'score',
        name: 'quality',
        value: 1,
      },
      {
        type: 'score',
        name: 'cost',
        value: 2,
      },
    ],
  },
  {
    meta: {
      id: 3,
      enabled: true,
      valid: true,
    },
    data: [
      {
        type: 'numeric',
        name: 'A',
        value: 150,
      },
      {
        type: 'numeric',
        name: 'B',
        value: 95,
      },
      {
        type: 'categorical',
        name: 'C',
        value: 'Blue',
      },
      {
        type: 'score',
        name: 'quality',
        value: 3,
      },
      {
        type: 'score',
        name: 'cost',
        value: 3,
      },
    ],
  },
  {
    meta: {
      id: 4,
      enabled: true,
      valid: true,
    },
    data: [
      {
        type: 'numeric',
        name: 'A',
        value: 110,
      },
      {
        type: 'numeric',
        name: 'B',
        value: 65,
      },
      {
        type: 'categorical',
        name: 'C',
        value: 'Blue',
      },
      {
        type: 'score',
        name: 'quality',
        value: 2,
      },
      {
        type: 'score',
        name: 'cost',
        value: 4,
      },
    ],
  },
  {
    meta: {
      id: 5,
      enabled: true,
      valid: true,
    },
    data: [
      {
        type: 'numeric',
        name: 'A',
        value: 170,
      },
      {
        type: 'numeric',
        name: 'B',
        value: 185,
      },
      {
        type: 'categorical',
        name: 'C',
        value: 'Red',
      },
      {
        type: 'score',
        name: 'quality',
        value: 4,
      },
      {
        type: 'score',
        name: 'cost',
        value: 3,
      },
    ],
  },
]

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ParetoFrontPlot plot={pareto} dataPoints={dummyDataPoints} />
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
        type="numeric"
      />
      <OneDPlot
        data={[
          { x: 1, y: [4, 2] },
          { x: 3, y: [3, 5] },
          { x: 4, y: [2, 6] },
        ]}
        height={'140px'}
        width={'140px'}
        referenceLineX={3}
        type="categorical"
      />
      <OneDPlot
        data={[
          { x: 'red', y: [4, 2] },
          { x: 'blue', y: [3, 5] },
          { x: 'green', y: [2, 6] },
        ]}
        height={'140px'}
        width={'140px'}
        referenceLineX={'blue'}
        type="categorical"
      />
    </div>
  </React.StrictMode>
)
