import { PNGPlot, ParetoFrontPlot } from '.'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { singlePng, paretoJson } from './demo-data'
import { OneDPlot } from './one-d-plot/one-d-plot'
import { DataEntry } from '@boostv/process-optimizer-frontend-core'

// cast the dummy data. Real data will be zod parsed
const pareto = paretoJson as unknown as {
  front_x_data: number[][]
  front_y_data: [number, number][]
  obj1_error: [number, number, number][]
  obj2_error: [number, number, number][]
  obj1_1D_data: [[[number], [number], [number], number]]
  obj2_1D_data: [[[number], [number], [number], number]]
  obj1_mean: number
  obj1_std: number
  obj2_mean: number
  obj2_std: number
  best_idx: number
}

const oned = {
  obj1_1D_data: pareto.obj1_1D_data,
  obj2_1D_data: pareto.obj2_1D_data,
}

console.log('oned', oned)

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
        value: -2.5,
      },
      {
        type: 'score',
        name: 'cost',
        value: 3.2,
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
        value: -3.5,
      },
      {
        type: 'score',
        name: 'cost',
        value: 1.8,
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
        value: -1.65,
      },
      {
        type: 'score',
        name: 'cost',
        value: 5.5,
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
        value: -2.8,
      },
      {
        type: 'score',
        name: 'cost',
        value: 7.3,
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
        value: -1.7,
      },
      {
        type: 'score',
        name: 'cost',
        value: 9.1,
      },
    ],
  },
]

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ParetoFrontPlot
      indexOfSelected={pareto.best_idx}
      plot={pareto}
      dataPoints={dummyDataPoints}
    />
    <PNGPlot plot={singlePng} />
    <div style={{ display: 'flex' }}>
      <OneDPlot
        data={{
          points: [
            { x: 1, y: 2 },
            { x: 2, y: 3 },
            { x: 3, y: 5 },
            { x: 4, y: 3 },
            { x: 5, y: 1 },
          ],
          type: 'score',
        }}
        height={'140px'}
        width={'140px'}
      />
      <OneDPlot
        data={{
          points: [
            { x: 1, y: [4, 2] },
            { x: 2, y: [2, 6] },
            { x: 3, y: [3, 5] },
            { x: 4, y: [4, 7] },
            { x: 5, y: [10, 11] },
          ],
          type: 'numeric',
          referenceLineX: 3,
        }}
        height={'140px'}
        width={'140px'}
      />
      <OneDPlot
        data={{
          points: [
            { x: 1, y: [4, 2] },
            { x: 3, y: [3, 5] },
            { x: 4, y: [2, 6] },
          ],
          type: 'categorical',
          referenceLineX: 3,
        }}
        height={'140px'}
        width={'140px'}
      />
      <OneDPlot
        data={{
          points: [
            { x: 'red', y: [4, 2] },
            { x: 'blue', y: [3, 5] },
            { x: 'green', y: [2, 6] },
          ],
          type: 'categorical',
          referenceLineX: 'blue',
        }}
        height={'140px'}
        width={'140px'}
      />
    </div>
  </React.StrictMode>
)
