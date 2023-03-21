import {
  Button,
  Card,
  CardContent,
  Grid,
  Snackbar,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material'
import Layout from '@sample/components/layout/layout'
import {
  Plots,
  Details,
  InputModel,
  LoadingButton,
  OptimizerConfigurator,
  DataPoints,
  ExperimentationGuide,
} from '@boostv/process-optimizer-frontend-ui'
import { Alert } from '@mui/material'
import { useStyles } from './experiment.style'
import { useMemo, useState } from 'react'
import { LoadingExperiment } from './loading-experiment'
import { useGlobal } from '@sample/context/global'
import { UISizeValue } from '@sample/context/global'
import { getSize, isUIBig } from '@sample/utility/ui-util'
import { AlertColor } from '@mui/material'
import {
  selectIsInitializing,
  CategoricalVariableType,
  useExperiment,
  saveObjectToLocalFile,
  useSelector,
  selectDataPoints,
  DataEntry,
  OptimizerConfig,
  ValueVariableType,
  ValidationViolations,
  validateExperiment,
} from '@boostv/process-optimizer-frontend-core'

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
    evaluate,
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

  const validationViolations: ValidationViolations = useMemo(
    () => validateExperiment(experiment),
    [experiment]
  )

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
        await evaluate({ ...experiment, dataPoints: [] })
      } else {
        await evaluate({
          ...experiment,
          extras: { objectivePars: 'expected_minimum', ...experiment.extras },
        })
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

  if (loading) {
    return <LoadingExperiment />
  }

  const tooltipText = `File format: ${experiment.info.dataFormatVersion}\nSoftware version: ${experiment.info.swVersion}`

  return (
    <Layout>
      <Card className={classes.experimentContainer}>
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
                    disabled={!experiment.changedSinceLastEvaluation && !debug}
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
                  <InputModel
                    isDisabled={dataPoints.length > 0}
                    valueVariables={valueVariables}
                    categoricalVariables={categoricalVariables}
                    onDeleteValueVariable={(index: number) => {
                      dispatch({
                        type: 'deleteValueVariable',
                        payload: index,
                      })
                    }}
                    onDeleteCategoricalVariable={(index: number) => {
                      dispatch({
                        type: 'deleteCategorialVariable',
                        payload: index,
                      })
                    }}
                    addValueVariable={(valueVariable: ValueVariableType) =>
                      dispatch({
                        type: 'addValueVariable',
                        payload: valueVariable,
                      })
                    }
                    editValueVariable={(valueVariable: {
                      index: number
                      variable: ValueVariableType
                    }) =>
                      dispatch({
                        type: 'editValueVariable',
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
                    editCategoricalVariable={(categoricalVariable: {
                      index: number
                      variable: CategoricalVariableType
                    }) =>
                      dispatch({
                        type: 'editCategoricalVariable',
                        payload: categoricalVariable,
                      })
                    }
                    violations={validationViolations}
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
                        isUIBig={isUIBig(uiSizes, 'result-data')}
                        toggleUISize={() =>
                          globalDispatch({
                            type: 'toggleUISize',
                            payload: 'result-data',
                          })
                        }
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
                        violations={validationViolations}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={UISizeValue.Big} xl={getSize(uiSizes, 'plots')}>
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
