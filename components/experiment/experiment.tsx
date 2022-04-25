import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Link,
  Snackbar,
  Switch,
  Tab,
  Tabs,
  Typography,
} from '@material-ui/core'
import Layout from '../layout/layout'
import OptimizerModel from '../input-model/optimizer-model'
import OptimizerConfigurator from '../optimizer-configurator'
import { Alert, Color, TabContext, TabList, TabPanel } from '@material-ui/lab'
import Details from '../details'
import DataPoints from '../data-points/data-points'
import { useStyles } from './experiment.style'
import { useExperiment, runExperiment } from '../../context/experiment-context'
import React, { useState, useEffect } from 'react'
import {
  ValueVariableType,
  CategoricalVariableType,
  OptimizerConfig,
  DataPointType,
} from '../../types/common'
import LoadingExperiment from './loading-experiment'
import { ResultData } from '../result-data/result-data'
import LoadingButton from '../loading-button/loading-button'
import { theme } from '../../theme/theme'
import { Plots } from '../plots/plots'
import { saveObjectToLocalFile } from '../../utility/save-to-local-file'
import { useGlobal } from '../../context/global-context'
import { UISizeValue } from '../../reducers/global-reducer'
import { getSize } from '../../utility/ui-util'
import { ConfigurationTab } from './configurationTab'

type SnackbarMessage = {
  message: string
  severity: Color
}

const Experiment = () => {
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
  const [value, setValue] = React.useState('1')

  const handleChange = (_event, newValue) => {
    setValue(newValue)
  }

  if (loading) {
    return <LoadingExperiment />
  }

  return (
    <Layout>
      <TabContext value={value}>
        <Box>
          <Typography variant="body2">{experiment.id}</Typography>
          <Typography variant="h5" gutterBottom>
            {experiment.info.name}{' '}
          </Typography>
          <TabList onChange={handleChange}>
            <Tab label="Item One" value="1" />
            <Tab label="Item Two" value="2" />
          </TabList>
        </Box>
        <Box className={classes.cardContentWrapper}>
          {global.state.debug && (
            <Switch
              checked={
                experiment.scoreVariables.filter(it => it.enabled).length > 1
              }
              onChange={() =>
                dispatch({
                  type: 'experiment/toggleMultiObjective',
                })
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
            marginLeft={theme.spacing(2)}
            height={42}
          />

          <TabPanel value="1">
            <ConfigurationTab />
          </TabPanel>
          <TabPanel value="2">
            <ResultData
              nextValues={nextValues}
              headers={headers}
              expectedMinimum={expectedMinimum}
              onMouseEnterExpand={() => setHighlightNextExperiments(true)}
              onMouseLeaveExpand={() => setHighlightNextExperiments(false)}
            />
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

            <Plots />
          </TabPanel>
        </Box>
      </TabContext>

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

export default Experiment
