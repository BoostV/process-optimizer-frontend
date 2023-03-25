import {
  Action,
  ApiProvider,
  ExperimentProvider,
  initialState,
  ManagedExperimentProvider,
  rootReducer,
  useExperiment,
} from '@core/context'
import React, { useReducer } from 'react'
import ReactDOM from 'react-dom/client'
import { ExperimentType } from '..'

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

type ManagerState = {
  experiments: Record<string, ExperimentType>
}
const initialManagerState: ManagerState = {
  experiments: {},
}
const managerReducer = (s: ManagerState, action: any | Action) => {
  return {
    ...s,
    experiments: {
      ...s.experiments,
      '123': rootReducer(
        { experiment: s.experiments['123'] ?? initialState.experiment },
        action
      ).experiment,
    },
  }
}

const ExperimentManager = () => {
  const [state, dispatch] = useReducer(managerReducer, initialManagerState)
  return (
    <>
      <h1>Experiments</h1>
      <h2>Name: {state?.experiments['123']?.info.name ?? ''}</h2>
      <ManagedExperimentProvider
        state={{
          experiment: state.experiments['123'] ?? initialState.experiment,
        }}
        dispatch={dispatch}
      >
        <ExperimentDemo />
      </ManagedExperimentProvider>
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ApiProvider>
      <ExperimentManager />
    </ApiProvider>
  </React.StrictMode>
)
