import { Box, Stack } from '@mui/system'
import {
  ExperimentProvider,
  ExperimentType,
  selectDataPoints,
  useExperiment,
  useSelector,
} from '@process-optimizer-frontend/core'
import catapult from '@ui/testing/sample-data/catapult.json'
import { DataPoints, ExperimentationGuide, Plots } from '..'
import { OptimizerConfigurator } from '../features/experiment'
import { OptimizerModel } from '../features/input-model'

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
            onUpdateDataPoints={() => {}}
          />
          <OptimizerConfigurator
            debug={false}
            onConfigUpdated={() => {}}
            config={experiment.optimizerConfig}
          />
          <OptimizerModel
            disabled={false}
            onDeleteValueVariable={() => {}}
            onDeleteCategoricalVariable={() => {}}
            addCategoricalVariable={() => {}}
            addValueVariable={() => {}}
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
