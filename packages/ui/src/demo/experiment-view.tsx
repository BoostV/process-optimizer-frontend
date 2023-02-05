import {
  ExperimentProvider,
  ExperimentType,
  useExperiment,
} from '@process-optimizer-frontend/core'

import catapult from '@ui/testing/sample-data/catapult.json'

const Experiment = () => {
  const { dispatch, state: experiment } = useExperiment()

  const loadSample = () => {
    dispatch({
      type: 'updateExperiment',
      payload: catapult as ExperimentType,
    })
  }
  return (
    <div>
      <button onClick={() => loadSample()}>Load sample</button>
      <pre>{JSON.stringify(experiment.experiment, undefined, 2)}</pre>
    </div>
  )
}

export const ExperimentView = () => {
  return (
    <ExperimentProvider experimentId="123">
      <Experiment />
    </ExperimentProvider>
  )
}
