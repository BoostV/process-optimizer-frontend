import { Box, Stack } from '@mui/system'
import {
  ExperimentProvider,
  ExperimentType,
  selectDataPoints,
  useExperiment,
  useSelector,
  DataEntry,
} from '@boostv/process-optimizer-frontend-core'

import catapult from '@ui/testing/sample-data/catapult.json'
import cake from '@ui/testing/sample-data/cake.json'
import { DataPoints, ExperimentationGuide, Plots } from '..'
import { OptimizerConfigurator } from '../features/experiment'
import { InputModel } from '../features/input-model'

const Experiment = () => {
  const {
    dispatch,
    state: { experiment },
    evaluate,
    loading,
  } = useExperiment()
  const dataPoints = useSelector(selectDataPoints)

  const loadSample = (data: ExperimentType) => {
    dispatch({
      type: 'updateExperiment',
      payload: data,
    })
  }
  return (
    <div>
      <button onClick={() => loadSample(catapult as ExperimentType)}>
        Load Catapult
      </button>
      <button onClick={() => loadSample(cake as ExperimentType)}>
        Load Cake
      </button>
      <button disabled={loading} onClick={() => evaluate()}>
        Run experiment
      </button>
      <Box>
        <Stack spacing={2} direction="row">
          <DataPoints
            experimentId={experiment.id}
            valueVariables={experiment.valueVariables}
            categoricalVariables={experiment.categoricalVariables}
            scoreVariables={experiment.scoreVariables}
            dataPoints={dataPoints}
            newestFirst={true}
            onToggleNewestFirst={() => {}}
            onUpdateDataPoints={(dataPoints: DataEntry[]) =>
              dispatch({
                type: 'updateDataPoints',
                payload: dataPoints,
              })
            }
          />
          <OptimizerConfigurator
            debug={false}
            onConfigUpdated={() => {}}
            config={experiment.optimizerConfig}
          />
          <InputModel
            isDisabled={false}
            onDeleteValueVariable={() => {}}
            onDeleteCategoricalVariable={() => {}}
            addCategoricalVariable={() => {}}
            addValueVariable={() => {}}
            editValueVariable={() => {}}
            editCategoricalVariable={() => {}}
            categoricalVariables={experiment.categoricalVariables}
            valueVariables={experiment.valueVariables}
          />
        </Stack>
        <Stack spacing={2} direction="row">
          <ExperimentationGuide />
        </Stack>
        <Stack spacing={2} direction="row">
          <Plots
            experiment={experiment}
            isUIBig={false}
            onSizeToggle={() => {}}
          />
        </Stack>
      </Box>

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
