import {
  Action,
  ApiProvider,
  State,
  initialState,
  ManagedExperimentProvider,
  rootReducer,
  useExperiment,
} from 'context'
import React, { useReducer, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { ExperimentType, migrate } from '..'

import catapult from 'sample-data/catapult.json'
import large from 'sample-data/large.json'

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
      <pre>{JSON.stringify(experiment.info, undefined, 2)}</pre>
    </>
  )
}

type ManagerState = {
  experiments: Record<string, ExperimentType>
}
const initialManagerState: ManagerState = {
  experiments: {
    catapult: migrate(catapult),
    large: migrate(large),
  },
}

const managerReducer = (
  s: ManagerState,
  action: any | Action
): ManagerState => {
  if (action.target) {
    const oldTargetState =
      s.experiments[action.target] ?? initialState.experiment
    const newTargetState = rootReducer({ experiment: oldTargetState }, action)
    const experiments = { ...s.experiments }
    experiments[action.target] = newTargetState.experiment
    return { ...s, experiments }
  }
  return s
}

const selectExperiment = (s: ManagerState, id: string): State => ({
  experiment: s.experiments[id] ?? initialState.experiment,
})

const ExperimentManager = () => {
  const [state, dispatch] = useReducer(managerReducer, initialManagerState)
  const [selected, setSelected] = useState<'catapult' | 'large'>('catapult')
  return (
    <>
      <h1>ManagedExperimentProvider</h1>
      <h2>Name: {state?.experiments[selected]?.info.name ?? ''}</h2>
      <button onClick={() => setSelected('catapult')}>Catapult</button>
      <button onClick={() => setSelected('large')}>Large</button>
      <ManagedExperimentProvider
        state={selectExperiment(state, selected)}
        dispatch={action => dispatch({ ...action, target: selected })}
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
