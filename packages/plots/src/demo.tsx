import { PNGPlot, ParetoFrontPlot } from '.'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { OneDPlot } from './one-d-plot/one-d-plot'
import {
  DataEntry,
  parseParetoPlot,
} from '@boostv/process-optimizer-frontend-core'
import paretoDemo from './sample-data/pareto-demo.json'
import singlePngJson from './sample-data/single-png.json'

const parsedPareto = parseParetoPlot(paretoDemo)
if (!parsedPareto) {
  throw new Error('pareto-demo.json is not a valid pareto payload')
}
// Bind to a non-null const so the type stays narrowed inside the App closure
// (TypeScript drops module-level narrowing of the guarded binding within
// nested function bodies).
const pareto = parsedPareto
const singlePng = (singlePngJson as { png: string }).png

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

function App() {
  const [selectedPoint, setSelectedPoint] = React.useState<number | null>(null)

  return (
    <>
      <ParetoFrontPlot
        indexOfSelected={selectedPoint ?? pareto.best_idx}
        plot={pareto}
        dataPoints={dummyDataPoints}
        onSelectIndex={index => setSelectedPoint(index)}
        renderControls={({ onToggleFitToFront, onResetToDefault }) => (
          <>
            <button onClick={onToggleFitToFront}>Toggle front fit</button>
            <button onClick={onResetToDefault}>Reset to default</button>
          </>
        )}
        onResetToDefault={() => setSelectedPoint(pareto.best_idx)}
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
              { x: 'Blue', y: [4, 2] },
              { x: 'Green', y: [3, 5] },
              { x: 'Red', y: [2, 6] },
            ],
            type: 'options',
            referenceLineX: 3,
          }}
          height={'140px'}
          width={'140px'}
        />
        <OneDPlot
          data={{
            points: [
              { x: 'Blue', y: [4, 2] },
              { x: 'Green', y: [3, 5] },
              { x: 'Red', y: [2, 6] },
            ],
            type: 'options',
            referenceLineX: 1,
          }}
          height={'140px'}
          width={'140px'}
        />
      </div>
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
