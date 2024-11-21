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
import { useEffect, useMemo, useState } from 'react'
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
  validateExperiment,
  useMessageController,
  Message,
  findDataPointViolations,
  ValidationViolations,
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
  const { setMessages } = useMessageController()

  const violations: ValidationViolations = useMemo(
    () => validateExperiment(experiment),
    [experiment]
  )

  useEffect(() => {
    const dataPointsMessages: Message[] = []
    const inputModelMessages: Message[] = []
    if (violations.duplicateVariableNames.length > 0) {
      dataPointsMessages.push({
        text: `All data points disabled because of duplicate variable names: ${violations.duplicateVariableNames.join(
          ', '
        )}.`,
        type: 'error',
      })
      inputModelMessages.push({
        text: `Please remove duplicate variable names: ${violations.duplicateVariableNames.join(
          ', '
        )}.`,
        type: 'error',
      })
    }
    if (violations.duplicateDataPointIds.length > 0) {
      dataPointsMessages.push({
        text: `Data points with duplicate meta-ids have been disabled: ${violations.duplicateDataPointIds.join(
          ', '
        )}.`,
        type: 'warning',
      })
    }
    setMessages(
      new Map<string, Message[]>([
        ['data-points', dataPointsMessages],
        ['input-model', inputModelMessages],
      ])
    )
  }, [setMessages, violations])

  const isInitializing = useSelector(selectIsInitializing)
  const dataPoints = useSelector(selectDataPoints)

  const dataPointsEditingDisabled =
    violations?.duplicateVariableNames.length > 0
  const violationsInTable = findDataPointViolations(violations)

  const [isSnackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessage>()
  const [highlightNextExperiments, setHighlightNextExperiments] =
    useState(false)

  const onDownload = () => {
    saveObjectToLocalFile(experiment, experiment.id)
  }

  const onRun = async () => {
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

  if (experiment === undefined) {
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
                    disableInteractive
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
                    isLoading={loading}
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
                    id="details"
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
                    id="input-model"
                    valueVariables={valueVariables}
                    categoricalVariables={categoricalVariables}
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
                    setValueVariableEnabled={(
                      index: number,
                      enabled: boolean
                    ) =>
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
                    setCategoricalVariableEnabled={(
                      index: number,
                      enabled: boolean
                    ) =>
                      dispatch({
                        type: 'setCategoricalVariableEnabled',
                        payload: {
                          index,
                          enabled,
                        },
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
                        loading={experiment.changedSinceLastEvaluation}
                        warning={
                          experiment.changedSinceLastEvaluation
                            ? 'Out of sync - optimizer must run again'
                            : undefined
                        }
                        id="experimentation-guide"
                        isUIBig={isUIBig(uiSizes, 'result-data')}
                        allowIndividualSuggestionCopy={!isInitializing}
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
                        id="data-points"
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
                        isEditingDisabled={dataPointsEditingDisabled}
                        violationsInTable={violationsInTable}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={UISizeValue.Big} xl={getSize(uiSizes, 'plots')}>
                  <Plots
                    id="plots"
                    isUIBig={isUIBig(uiSizes, 'plots')}
                    experiment={experiment}
                    onSizeToggle={() =>
                      globalDispatch({
                        type: 'toggleUISize',
                        payload: 'plots',
                      })
                    }
                    loading={experiment.changedSinceLastEvaluation}
                    warning={
                      experiment.changedSinceLastEvaluation
                        ? 'Out of sync - optimizer must run again'
                        : undefined
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
