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

import { samples, sampleLabels, type SampleName } from './samples'
import { DataPoints, ExperimentationGuide, Plots, Result } from '..'
import { OptimizerConfigurator } from '../features/experiment'
import { InputModel } from '../features/input-model'
import { Switch } from '@mui/material'
import { useEffect, useState } from 'react'

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

  // Deterministic addressing for the inspection harness: ?sample=<name> loads a
  // registry sample on mount. Dev/demo affordance only.
  useEffect(() => {
    const name = new URLSearchParams(window.location.search).get('sample')
    if (name && name in samples) {
      loadSample(samples[name as SampleName])
    }
    ;(window as unknown as { __SAMPLE_NAMES__?: string[] }).__SAMPLE_NAMES__ =
      Object.keys(samples)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      {(Object.keys(samples) as SampleName[]).map(name => (
        <button
          key={name}
          data-testid={`load-sample-${name}`}
          onClick={() => loadSample(samples[name])}
        >
          Load {sampleLabels[name]}
        </button>
      ))}
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
          <div data-testid="result-region">
            <Result id={experiment.id} showParetoHoverEllipse />
          </div>
          <div data-testid="plots-region">
            <Plots experiment={experiment} />
          </div>
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
