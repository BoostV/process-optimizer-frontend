import { Box, Stack } from '@mui/system'
import {
  ExperimentProvider,
  selectDataPoints,
  useExperiment,
  useSelector,
  DataEntry,
  migrate,
  selectIsMultiObjective,
  CategoricalVariableType,
  ValueVariableType,
} from '@boostv/process-optimizer-frontend-core'

import catapult from '@ui/testing/sample-data/catapult.json'
import cake from '@ui/testing/sample-data/cake.json'
import { DataPoints, ExperimentationGuide, Plots } from '..'
import { OptimizerConfigurator } from '../features/experiment'
import { InputModel } from '../features/input-model'
import { Switch } from '@mui/material'
import { useState } from 'react'

const Experiment = () => {
  const {
    dispatch,
    state: { experiment },
    evaluate,
    loading,
  } = useExperiment()
  const dataPoints = useSelector(selectDataPoints)
  const isMultiObjective = useSelector(selectIsMultiObjective)
  const [newestFirst, setNewestFirst] = useState(false)

  const loadSample = (data: unknown) => {
    dispatch({
      type: 'updateExperiment',
      payload: migrate(data),
    })
  }
  return (
    <div>
      <button onClick={() => loadSample(catapult)}>Load Catapult</button>
      <button onClick={() => loadSample(cake)}>Load Cake</button>
      <button disabled={loading} onClick={() => evaluate()}>
        Run experiment
      </button>
      <Switch
        checked={isMultiObjective}
        onChange={() => dispatch({ type: 'experiment/toggleMultiObjective' })}
        name="multiobj"
        color="secondary"
      />
      <Box>
        <Stack spacing={2} direction="row">
          <DataPoints
            experimentId={experiment.id}
            valueVariables={experiment.valueVariables}
            categoricalVariables={experiment.categoricalVariables}
            scoreVariables={experiment.scoreVariables}
            dataPoints={dataPoints}
            newestFirst={newestFirst}
            onToggleNewestFirst={() => setNewestFirst(!newestFirst)}
            onUpdateDataPoints={(dataPoints: DataEntry[]) =>
              dispatch({
                type: 'updateDataPoints',
                payload: dataPoints,
              })
            }
          />
          <ExperimentationGuide />
          <InputModel
            valueVariables={experiment.valueVariables}
            categoricalVariables={experiment.categoricalVariables}
            addValueVariable={(valueVariable: ValueVariableType) =>
              dispatch({
                type: 'addValueVariable',
                payload: valueVariable,
              })
            }
            editValueVariable={(
              index: number,
              newVariable: ValueVariableType
            ) =>
              dispatch({
                type: 'editValueVariable',
                payload: {
                  index,
                  newVariable,
                },
              })
            }
            onDeleteValueVariable={(index: number) => {
              dispatch({
                type: 'deleteValueVariable',
                payload: index,
              })
            }}
            setValueVariableEnabled={(index: number, enabled: boolean) =>
              dispatch({
                type: 'setValueVariableEnabled',
                payload: {
                  index,
                  enabled,
                },
              })
            }
            addCategoricalVariable={(
              categoricalVariable: CategoricalVariableType
            ) =>
              dispatch({
                type: 'addCategorialVariable',
                payload: categoricalVariable,
              })
            }
            editCategoricalVariable={(
              index: number,
              newVariable: CategoricalVariableType
            ) =>
              dispatch({
                type: 'editCategoricalVariable',
                payload: {
                  index,
                  newVariable,
                },
              })
            }
            onDeleteCategoricalVariable={(index: number) => {
              dispatch({
                type: 'deleteCategorialVariable',
                payload: index,
              })
            }}
            setCategoricalVariableEnabled={(index: number, enabled: boolean) =>
              dispatch({
                type: 'setCategoricalVariableEnabled',
                payload: {
                  index,
                  enabled,
                },
              })
            }
          />
        </Stack>
        <Stack spacing={2} direction="row">
          <OptimizerConfigurator
            debug={false}
            config={experiment.optimizerConfig}
          />
          <Plots experiment={experiment} />
        </Stack>
        <Stack spacing={2} direction="row"></Stack>
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
