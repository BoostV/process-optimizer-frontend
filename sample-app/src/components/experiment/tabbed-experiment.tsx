import {
  AlertColor,
  Box,
  Button,
  Grid,
  Snackbar,
  Switch,
  Tab,
  Tooltip,
  Typography,
} from '@mui/material'
import Layout from '@/components/layout/layout'
import { Alert } from '@mui/material'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { useStyles } from './experiment.style'
import { useExperiment, runExperiment, useSelector } from '@/context/experiment'
import { useState } from 'react'
import LoadingExperiment from './loading-experiment'
import LoadingButton from '@process-optimizer-frontend/core/src/features/core/loading-button/loading-button'
import { Plots } from '@process-optimizer-frontend/core/src/features/plots/plots'
import { saveObjectToLocalFile } from '@process-optimizer-frontend/core/src/common/util/save-to-local-file'
import { useGlobal } from '@/context/global'
import { ConfigurationTab } from './configurationTab'
import { DataEntryTab } from './dataEntryTab'
import { State } from '@/context/global'
import { selectIsInitializing } from '@/context/experiment'
import { isUIBig } from '@/utility/ui-util'

type SnackbarMessage = {
  message: string
  severity: AlertColor
}

const TabbedExperiment = () => {
  const { classes } = useStyles()
  const {
    state: { experiment },
    dispatch,
    loading,
  } = useExperiment()
  const {
    state: { focus, debug, uiSizes },
    dispatch: globalDispatch,
  } = useGlobal()

  const isInitializing = useSelector(selectIsInitializing)

  const [isSnackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessage>()
  const [isRunning, setRunning] = useState(false)

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

  const handleChange = (_event: unknown, newValue: State['focus']) => {
    globalDispatch({ type: 'global/setFocus', payload: newValue })
  }

  if (loading) {
    return <LoadingExperiment />
  }

  const tooltipText = `File format: ${experiment.info.dataFormatVersion}\nSoftware version: ${experiment.info.swVersion}`

  return (
    <Layout>
      <TabContext value={focus}>
        <Grid container justifyContent="space-around">
          <Grid item xs>
            <Typography variant="h4" gutterBottom>
              {experiment.info.name}
            </Typography>
            <Tooltip
              title={
                <span style={{ whiteSpace: 'pre-line' }}>{tooltipText}</span>
              }
            >
              <Typography variant="caption">{experiment.id}</Typography>
            </Tooltip>
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
                  experiment.scoreVariables.filter((it: any) => it.enabled)
                    .length > 1
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
              marginLeft={2}
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
