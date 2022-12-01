import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Snackbar,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material'
import Layout from '@/components/layout/layout'
import OptimizerModel from '@process-optimizer-frontend/core/src/features/input-model/optimizer-model'
import { Alert } from '@mui/material'
import Details from '@process-optimizer-frontend/core/src/features/core/details'
import { Plots } from '@process-optimizer-frontend/core/src/features/plots/plots'
import { saveObjectToLocalFile } from '@process-optimizer-frontend/core/src/common/util/save-to-local-file'
import { useStyles } from './experiment.style'
import {
  useExperiment,
  runExperiment,
  useSelector,
  selectDataPoints,
} from '@/context/experiment'
import { useState } from 'react'
import LoadingExperiment from './loading-experiment'
import { ExperimentationGuide } from '@/components/result-data/experimentation-guide'
import { useGlobal } from '@/context/global'
import { UISizeValue } from '@/context/global'
import { getSize, isUIBig } from '@/utility/ui-util'
import { AlertColor } from '@mui/material'
import { selectIsInitializing } from '@/context/experiment'
import {
  CategoricalVariableType,
  DataEntry,
  OptimizerConfig,
  ValueVariableType,
} from '@process-optimizer-frontend/core/src/common/types/common'
import LoadingButton from '@process-optimizer-frontend/core/src/features/core/loading-button/loading-button'
import { OptimizerConfigurator } from '@process-optimizer-frontend/core/src/features/experiment/optimizer-configurator'
import DataPoints from '@process-optimizer-frontend/core/src/features/data-points/data-points'

type SnackbarMessage = {
  message: string
  severity: AlertColor
}

const LegacyExperiment = () => {
  const { classes } = useStyles()
  const {
    state: { experiment },
    dispatch,
    loading,
  } = useExperiment()
  const {
    state: {
      debug,
      uiSizes,
      flags: { advancedConfiguration },
      dataPointsNewestFirst,
    },
    dispatch: globalDispatch,
  } = useGlobal()

  const isInitializing = useSelector(selectIsInitializing)
  const dataPoints = useSelector(selectDataPoints)

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
      if (isInitializing) {
        await runExperiment(dispatch, { ...experiment, dataPoints: [] })
      } else {
        await runExperiment(dispatch, experiment)
      }
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

  const tooltipText = `File format: ${experiment.info.dataFormatVersion}\nSoftware version: ${experiment.info.swVersion}`

  return (
    <Layout>
      <Card className={classes.experimentContainer}>
        <Box className={classes.cardContentWrapper}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={7}>
                    <Tooltip
                      placement="bottom-start"
                      title={
                        <span style={{ whiteSpace: 'pre-line' }}>
                          {tooltipText}
                        </span>
                      }
                    >
                      <Typography variant="body2">{experiment.id}</Typography>
                    </Tooltip>
                    <Typography variant="h5" gutterBottom>
                      {experiment.info.name}{' '}
                    </Typography>
                  </Grid>
                  <Grid item xs={5} container justifyContent="flex-end">
                    {debug && (
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
                      disabled={
                        !experiment.changedSinceLastEvaluation && !debug
                      }
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

                  {advancedConfiguration && (
                    <Grid item xs={12}>
                      <OptimizerConfigurator
                        config={experiment.optimizerConfig}
                        debug={debug}
                        onConfigUpdated={(config: OptimizerConfig) =>
                          dispatch({
                            type: 'updateConfiguration',
                            payload: config,
                          })
                        }
                      />
                    </Grid>
                  )}
                </Grid>
              </Grid>

              <Grid item xs={9}>
                <Grid container spacing={2}>
                  <Grid
                    item
                    xs={UISizeValue.Big}
                    xl={getSize(uiSizes, 'result-data')}
                  >
                    <Grid
                      container
                      spacing={2}
                      className={
                        highlightNextExperiments ? classes.highlight : ''
                      }
                    >
                      <Grid item xs={12}>
                        <ExperimentationGuide
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
                          experimentId={experiment.id}
                          valueVariables={experiment.valueVariables}
                          categoricalVariables={experiment.categoricalVariables}
                          scoreVariables={experiment.scoreVariables}
                          dataPoints={dataPoints}
                          newestFirst={dataPointsNewestFirst}
                          onToggleNewestFirst={() =>
                            globalDispatch({
                              type: 'setDataPointsNewestFirst',
                              payload: !dataPointsNewestFirst,
                            })
                          }
                          onUpdateDataPoints={(dataPoints: DataEntry[]) =>
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
                    xl={getSize(uiSizes, 'plots')}
                  >
                    <Plots
                      isUIBig={isUIBig(uiSizes, 'plots')}
                      experiment={experiment}
                      onSizeToggle={() =>
                        globalDispatch({
                          type: 'toggleUISize',
                          payload: 'plots',
                        })
                      }
                    />
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
