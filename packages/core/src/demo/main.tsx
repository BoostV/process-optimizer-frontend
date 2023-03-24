import {
  ApiProvider,
  ExperimentProvider,
  ExperimentsProvider,
  useExperiment,
  useParent,
} from '@core/context'
import React from 'react'
import ReactDOM from 'react-dom/client'

const ExperimentDemo = () => {
  const {
    state: { experiment },
    dispatch,
  } = useExperiment()

  const handleChange = (value: string) => {
    dispatch({ type: 'updateExperimentName', payload: value })
  }

  return (
    <>
      <h1>Experiment</h1>
      <textarea
        value={experiment?.info.name}
        onChange={e => handleChange(e.target.value)}
      ></textarea>
      <pre>{JSON.stringify(experiment, undefined, 2)}</pre>
    </>
  )
}

const ExperimentManager = () => {
  const [state, dispatch] = useParent()
  return (
    <>
      <h1>Experiments</h1>
      <h2>Name: {state?.experiments['123']?.info.name ?? ''}</h2>
      <ExperimentProvider experimentId="123">
        <ExperimentDemo />
      </ExperimentProvider>
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ApiProvider>
      <ExperimentsProvider>
        <ExperimentManager />
      </ExperimentsProvider>
    </ApiProvider>
  </React.StrictMode>
)
