import {
  Action,
  ApiProvider,
  State,
  initialState,
  ManagedExperimentProvider,
  rootReducer,
  useExperiment,
  useAutoEvaluate,
} from '../context'
import React, { useReducer, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { ExperimentType, migrate } from '..'

import catapult from '../sample-data/catapult.json'
import large from '../sample-data/large.json'

const ExperimentDemo = () => {
  useAutoEvaluate()
  const {
    state: { experiment },
    dispatch,
    loading,
    evaluate,
  } = useExperiment()

  const handleChange = (value: string) => {
    dispatch({ type: 'updateExperimentName', payload: value })
  }

  const handleVariableChange = (value: string) => {
    dispatch({
      type: 'editValueVariable',
      payload: { index: 0, variable: JSON.parse(value) },
    })
  }

  return (
    <>
      <h1>Experiment</h1>
      <button onClick={() => evaluate()}>Evaluate</button>
      <label>
        Name:
        <textarea
          value={experiment?.info.name}
          onChange={e => handleChange(e.target.value)}
        />
      </label>
      <label>
        Variables:
        <textarea
          value={JSON.stringify(experiment.valueVariables[0], undefined, 2)}
          onChange={e => handleVariableChange(e.target.value)}
        />
      </label>
      <br />
      <label>
        Loading: <pre>{JSON.stringify(loading, undefined, 2)}</pre>
      </label>
      <label>
        Changed since last evaluation:
        <pre>
          {JSON.stringify(experiment.changedSinceLastEvaluation, undefined, 2)}
        </pre>
      </label>
      <pre>{JSON.stringify(experiment.valueVariables, undefined, 2)}</pre>
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
    <ApiProvider config={{ apiKey: 'none' }}>
      <ExperimentManager />
    </ApiProvider>
  </React.StrictMode>
)
