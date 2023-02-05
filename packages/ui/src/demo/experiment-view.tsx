import {
  ExperimentProvider,
  ExperimentType,
  selectDataPoints,
  useExperiment,
  useSelector,
} from '@process-optimizer-frontend/core'

import catapult from '@ui/testing/sample-data/catapult.json'
import { DataPoints, Plots } from '..'

const Experiment = () => {
  const {
    dispatch,
    state: { experiment },
  } = useExperiment()
  const dataPoints = useSelector(selectDataPoints)

  const loadSample = () => {
    dispatch({
      type: 'updateExperiment',
      payload: catapult as ExperimentType,
    })
  }
  return (
    <div>
      <button onClick={() => loadSample()}>Load sample</button>
      <DataPoints
        experimentId={experiment.id}
        valueVariables={experiment.valueVariables}
        categoricalVariables={experiment.categoricalVariables}
        scoreVariables={experiment.scoreVariables}
        dataPoints={dataPoints}
        newestFirst={true}
        onToggleNewestFirst={() => {}}
        onUpdateDataPoints={() => {}}
      />
      <Plots experiment={experiment} isUIBig={false} onSizeToggle={() => {}} />
      <pre>{JSON.stringify(experiment, undefined, 2)}</pre>
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
