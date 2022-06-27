import {
  Box,
  Button,
  Grid,
  Snackbar,
  Switch,
  Tab,
  Typography,
} from '@mui/material'
import Layout from '../layout/layout'
import { Alert, Color, TabContext, TabList, TabPanel } from '@mui/lab'
import { useStyles } from './experiment.style'
import { useExperiment, runExperiment } from '../../context/experiment-context'
import React, { useState } from 'react'
import LoadingExperiment from './loading-experiment'
import LoadingButton from '../loading-button/loading-button'
import { theme } from '../../theme/theme'
import { Plots } from '../plots/plots'
import { saveObjectToLocalFile } from '../../utility/save-to-local-file'
import { useGlobal } from '../../context/global-context'
import { ConfigurationTab } from './configurationTab'
import { DataEntryTab } from './dataEntryTab'

type SnackbarMessage = {
  message: string
  severity: Color
}

const TabbedExperiment = () => {
  const classes = useStyles()
  const {
    state: { experiment },
    dispatch,
    loading,
  } = useExperiment()
  const {
    state: { focus, debug },
    dispatch: globalDispatch,
  } = useGlobal()

  const [isSnackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessage>()
  const [isRunning, setRunning] = useState(false)

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

  const handleChange = (_event, newValue) => {
    globalDispatch({ type: 'global/setFocus', payload: newValue })
  }

  if (loading) {
    return <LoadingExperiment />
  }

  return (
    <Layout>
      <TabContext value={focus}>
        <Grid container justifyContent="space-around">
          <Grid item xs>
            <Typography variant="h4" gutterBottom>
              {experiment.info.name}
            </Typography>
            <Typography variant="caption">{experiment.id}</Typography>
          </Grid>
          <Grid item xs={6}>
            <TabList onChange={handleChange}>
              <Tab label="Configuration" value="configuration" />
              <Tab
                label="Data Entry"
                value="data-entry"
                disabled={
                  experiment.valueVariables.length === 0 &&
                  experiment.categoricalVariables.length === 0
                }
              />
              <Tab
                label="Results"
                value="results"
                disabled={
                  !experiment.results.plots ||
                  experiment.results.plots.length === 0
                }
              />
            </TabList>
          </Grid>
          <Grid item xs="auto">
            {debug && (
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
          </Grid>
        </Grid>
        <Box className={classes.cardContentWrapper}>
          <TabPanel value="configuration">
            <ConfigurationTab />
          </TabPanel>
          <TabPanel value="data-entry">
            <DataEntryTab />
          </TabPanel>
          <TabPanel value="results">
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

export default TabbedExperiment
