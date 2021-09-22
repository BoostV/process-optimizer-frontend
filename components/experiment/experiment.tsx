import { Box, Button, Card, CardContent, Grid, Snackbar, Typography } from '@material-ui/core'
import Layout from '../layout/layout'
import OptimizerModel from '../input-model/optimizer-model';
import OptimizerConfigurator from '../optimizer-configurator';
import { Alert, Color } from '@material-ui/lab';
import Details from '../details';
import DataPoints from '../data-points/data-points';
import { useStyles } from './experiment.style';
import { useExperiment, saveExperiment, runExperiment } from '../../context/experiment-context';
import React, { useState, useEffect } from 'react';
import { ValueVariableType, CategoricalVariableType, OptimizerConfig, DataPointType } from '../../types/common';
import LoadingExperiment from './loading-experiment';
import { NextExperiments } from '../next-experiments/next-experiments';
import LoadingButton from '../loading-button/loading-button';
import { theme } from '../../theme/theme';
import { Plots } from '../plots/plots';
import { saveObjectToLocalFile } from '../../utility/save-to-local-file';
import { useGlobal } from '../../context/global-context';
import { UISizeValue } from '../../reducers/global-reducer';
import { getSize } from '../../utility/ui-util';

type ExperimentProps = {
    allowSaveToServer: boolean
}

type SnackbarMessage = {
    message: string
    severity: Color
}

export default function Experiment(props: ExperimentProps) {
    const { allowSaveToServer } = props
    const classes = useStyles()
    const { state: {
        experiment
    }, dispatch, loading } = useExperiment()
    const global = useGlobal()

    const [lastSavedExperiment, setLastSavedExperiment] = useState(experiment)
    const [isDirty, setDirty] = useState(false)
    const [isSnackbarOpen, setSnackbarOpen] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessage>()
    const [isRunning, setRunning] = useState(false)
    const [isSaving, setSaving] = useState(false)
    const [highlightNextExperiments, setHighlightNextExperiments] = useState(false)

    useEffect(() => {
        if (lastSavedExperiment && JSON.stringify(lastSavedExperiment) !== JSON.stringify(experiment)) {
            setDirty(true)
        }
    }, [experiment, lastSavedExperiment])

    const onDownload = () => {
        saveObjectToLocalFile(experiment, experiment.id)
    } 

    const onSave = async () => {
        setSaving(true)
        try {
            await saveExperiment(experiment)
            setLastSavedExperiment(experiment)
            saveCompleted({ message: "Experiment saved", severity: 'success' })
        } catch (error) {
            console.error('fetch error', error)
            saveCompleted({ message: "Experiment save failed", severity: 'error' })
        }
    }

    const saveCompleted = (snackbarMessage: SnackbarMessage) => {
        setDirty(snackbarMessage.severity !== 'success')
        setSaving(false)
        openSnackbar(snackbarMessage)
    }

    const onRun = async () => {
        setRunning(true)
        try {
            await runExperiment(dispatch, experiment)
            setDirty(true)
            runCompleted({ message: "Experiment run completed", severity: 'success' })
        } catch (error) {
            runCompleted({ message: "Experiment run failed", severity: 'error' })
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

    const headers = valueVariables.map(it => it.name).concat(categoricalVariables.map(it => it.name))
    
    const nextValues: any[][] = (experiment.results.next && Array.isArray(experiment.results.next[0])) ? experiment.results.next as unknown as any[][] : (experiment.results.next ? [experiment.results.next] : [])

    const expectedMinimum: any[][] = experiment.results.expectedMinimum
    
    if (loading) {
        return  <LoadingExperiment />
    }

    return (
        <Layout>
            <Card className={[classes.experimentContainer, isDirty && allowSaveToServer ? classes.experimentContainerDirty : ''].join(' ')}>
                <Box className={classes.cardContentWrapper}>
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Grid container>
                                    <Grid item xs={7}>
                                        <Typography variant="body2">
                                            {experiment.id}
                                        </Typography>
                                        <Typography variant="h5" gutterBottom>
                                            {/* Experiment {experiment.id} {isDirty && '(unsaved)'} [{experiment.results.rawResult || 'No results'}]  */}
                                            {experiment.info.name} {isDirty && allowSaveToServer ? '(unsaved)': ''}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={5} container justifyContent="flex-end">
                                        <Button variant="contained" className={classes.actionButton} onClick={onDownload} color="primary">Download</Button>
                                        {allowSaveToServer && 
                                            <LoadingButton 
                                                onClick={onSave} 
                                                isLoading={isSaving} 
                                                label="Save" 
                                                height={42} 
                                                marginLeft={theme.spacing(2)}
                                                isFlashing={isDirty} />
                                        }
                                        <LoadingButton 
                                            onClick={onRun} 
                                            isLoading={isRunning} 
                                            label="Run" 
                                            marginLeft={theme.spacing(2)}
                                            height={42} />
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Grid item xs={3}>
                                <Grid container spacing={2}>

                                    <Grid item xs={12}>
                                        <Details
                                            info={experiment.info}
                                            updateName={(name: string) => dispatch({ type: 'updateExperimentName', payload: name })}
                                            updateDescription={(description: string) => dispatch({ type: 'updateExperimentDescription', payload: description })} />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <OptimizerModel
                                            valueVariables={valueVariables}
                                            categoricalVariables={categoricalVariables}
                                            disabled={experiment.dataPoints.length > 0}
                                            onDeleteValueVariable={(valueVariable: ValueVariableType) => { dispatch({ type: 'deleteValueVariable', payload: valueVariable }) }}
                                            onDeleteCategoricalVariable={(categoricalVariable: CategoricalVariableType) => { dispatch({ type: 'deleteCategorialVariable', payload: categoricalVariable }) }}
                                            addValueVariable={(valueVariable: ValueVariableType) => dispatch({ type: 'addValueVariable', payload: valueVariable })}
                                            addCategoricalVariable={(categoricalVariable: CategoricalVariableType) => dispatch({ type: 'addCategorialVariable', payload: categoricalVariable })} />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <OptimizerConfigurator
                                            config={experiment.optimizerConfig}
                                            onConfigUpdated={(config: OptimizerConfig) => dispatch({ type: 'updateConfiguration', payload: config })} />
                                    </Grid>

                                </Grid>
                            </Grid>

                            <Grid item xs={9}>
                                <Grid container spacing={2}>
                                    <Grid item xs={UISizeValue.Big} xl={getSize(global.state, 'next-experiments')}>
                                        <Grid container spacing={2} className={highlightNextExperiments ? classes.highlight : ''}>
                                            <Grid item xs={12}>
                                                <NextExperiments
                                                    nextValues={nextValues}
                                                    headers={headers}
                                                    expectedMinimum={expectedMinimum}
                                                    onMouseEnterExpand={() => setHighlightNextExperiments(true)}
                                                    onMouseLeaveExpand={() => setHighlightNextExperiments(false)} />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <DataPoints
                                                    valueVariables={experiment.valueVariables}
                                                    categoricalVariables={experiment.categoricalVariables}
                                                    dataPoints={experiment.dataPoints}
                                                    onUpdateDataPoints={(dataPoints: DataPointType[][]) => dispatch({ type: 'updateDataPoints', payload: dataPoints })} />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={UISizeValue.Big} xl={getSize(global.state, 'plots')}>
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
                onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbarMessage?.severity}>{snackbarMessage?.message}</Alert>
            </Snackbar>

        </Layout>
    )
}