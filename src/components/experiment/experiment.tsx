import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Snackbar,
  Switch,
  Typography,
} from '@mui/material'
import Layout from '../layout/layout'
import OptimizerModel from '../input-model/optimizer-model'
import OptimizerConfigurator from '../optimizer-configurator'
import { Alert } from '@mui/material'
import Details from '../details'
import DataPoints from '../data-points/data-points'
import { useStyles } from './experiment.style'
import { useExperiment, runExperiment } from '../../context/experiment-context'
import React, { useState } from 'react'
import {
  ValueVariableType,
  CategoricalVariableType,
  OptimizerConfig,
  DataPointType,
} from '../../types/common'
import LoadingExperiment from './loading-experiment'
import { ResultData } from '../result-data/result-data'
import LoadingButton from '../loading-button/loading-button'
import { Plots } from '../plots/plots'
import { saveObjectToLocalFile } from '../../utility/save-to-local-file'
import { useGlobal } from '../../context/global-context'
import { UISizeValue } from '../../reducers/global-reducer'
import { getSize } from '../../utility/ui-util'
import { AlertColor } from '@mui/material'

type SnackbarMessage = {
  message: string
  severity: AlertColor
}

const LegacyExperiment = () => {
  const classes = useStyles()
  const {
    state: { experiment },
    dispatch,
    loading,
  } = useExperiment()
  const global = useGlobal()

  const [isSnackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessage>()
  const [isRunning, setRunning] = useState(false)
  const [highlightNextExperiments, setHighlightNextExperiments] =
    useState(false)

  const onDownload = () => {
    saveObjectToLocalFile(experiment, experiment.id)
  }

  const onRun = async () => {
    setRunning(true)
    try {
      await runExperiment(dispatch, experiment)
      runCompleted({ message: 'Experiment run completed', severity: 'success' })
    } catch (error) {
      runCompleted({ message: 'Experiment run failed', severity: 'error' })
      console.error('fetch error', error)
    }
  }

  const runCompleted = (snackbarMessage: SnackbarMessage) => {
    setRunning(false)
    openSnackbar(snackbarMessage)
  }

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  const openSnackbar = (snackbarMessage: SnackbarMessage) => {
    setSnackbarMessage(snackbarMessage)
    setSnackbarOpen(true)
  }

  const valueVariables = experiment.valueVariables
  const categoricalVariables = experiment.categoricalVariables

  const headers = valueVariables
    .map(it => it.name)
    .concat(categoricalVariables.map(it => it.name))

  const nextValues: any[][] =
    experiment.results.next && Array.isArray(experiment.results.next[0])
      ? (experiment.results.next as unknown as any[][])
      : experiment.results.next
      ? [experiment.results.next]
      : []

  const expectedMinimum: any[][] = experiment.results.expectedMinimum

  if (loading) {
    return <LoadingExperiment />
  }

  return (
    <Layout>
      <Card className={classes.experimentContainer}>
        <Box className={classes.cardContentWrapper}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={7}>
                    <Typography variant="body2">{experiment.id}</Typography>
                    <Typography variant="h5" gutterBottom>
                      {experiment.info.name}{' '}
                    </Typography>
                  </Grid>
                  <Grid item xs={5} container justifyContent="flex-end">
                    {global.state.debug && (
                      <Switch
                        checked={
                          experiment.scoreVariables.filter(it => it.enabled)
                            .length > 1
                        }
                        onChange={() =>
                          dispatch({ type: 'experiment/toggleMultiObjective' })
                        }
                        name="multiobj"
                        color="secondary"
                      />
                    )}
                    <Button
                      variant="contained"
                      className={classes.actionButton}
                      onClick={onDownload}
                      color="primary"
                    >
                      Download
                    </Button>
                    <LoadingButton
                      onClick={onRun}
                      isLoading={isRunning}
                      label="Run"
                      marginLeft={2}
                      height={42}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Details
                      info={experiment.info}
                      updateName={(name: string) =>
                        dispatch({
                          type: 'updateExperimentName',
                          payload: name,
                        })
                      }
                      updateDescription={(description: string) =>
                        dispatch({
                          type: 'updateExperimentDescription',
                          payload: description,
                        })
                      }
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <OptimizerModel
                      valueVariables={valueVariables}
                      categoricalVariables={categoricalVariables}
                      disabled={experiment.dataPoints.length > 0}
                      onDeleteValueVariable={(
                        valueVariable: ValueVariableType
                      ) => {
                        dispatch({
                          type: 'deleteValueVariable',
                          payload: valueVariable,
                        })
                      }}
                      onDeleteCategoricalVariable={(
                        categoricalVariable: CategoricalVariableType
                      ) => {
                        dispatch({
                          type: 'deleteCategorialVariable',
                          payload: categoricalVariable,
                        })
                      }}
                      addValueVariable={(valueVariable: ValueVariableType) =>
                        dispatch({
                          type: 'addValueVariable',
                          payload: valueVariable,
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
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <OptimizerConfigurator
                      config={experiment.optimizerConfig}
                      onConfigUpdated={(config: OptimizerConfig) =>
                        dispatch({
                          type: 'updateConfiguration',
                          payload: config,
                        })
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={9}>
                <Grid container spacing={2}>
                  <Grid
                    item
                    xs={UISizeValue.Big}
                    xl={getSize(global.state, 'result-data')}
                  >
                    <Grid
                      container
                      spacing={2}
                      className={
                        highlightNextExperiments ? classes.highlight : ''
                      }
                    >
                      <Grid item xs={12}>
                        <ResultData
                          nextValues={nextValues}
                          headers={headers}
                          expectedMinimum={expectedMinimum}
                          onMouseEnterExpand={() =>
                            setHighlightNextExperiments(true)
                          }
                          onMouseLeaveExpand={() =>
                            setHighlightNextExperiments(false)
                          }
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <DataPoints
                          valueVariables={experiment.valueVariables}
                          categoricalVariables={experiment.categoricalVariables}
                          scoreVariables={experiment.scoreVariables}
                          dataPoints={experiment.dataPoints}
                          onUpdateDataPoints={(dataPoints: DataPointType[][]) =>
                            dispatch({
                              type: 'updateDataPoints',
                              payload: dataPoints,
                            })
                          }
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    item
                    xs={UISizeValue.Big}
                    xl={getSize(global.state, 'plots')}
                  >
                    <Plots />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Box>
      </Card>

      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarMessage?.severity}
        >
          {snackbarMessage?.message}
        </Alert>
      </Snackbar>
    </Layout>
  )
}

export default LegacyExperiment
