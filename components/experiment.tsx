import { Button, Card, CardContent, Grid, Snackbar, Typography } from '@material-ui/core'
import Layout from './layout'
import OptimizerModel from './optimizer-model';
import OptimizerConfigurator from './optimizer-configurator';
import { Alert } from '@material-ui/lab';
import ModelEditor from './model-editor';
import DataPoints from './data-points';
import { useStyles } from '../styles/experiment.style';
import { useExperiment, saveExperiment, runExperiment } from '../context/experiment-context';
import React, { useState, useEffect } from 'react';
import { ValueVariableType, CategoricalVariableType, OptimizerConfig, DataPointType } from '../types/common';

export default function Experiment() {
    const classes = useStyles();
    const { state: {
        experiment
    }, dispatch, loading } = useExperiment()

    const [lastSavedExperiment, setLastSavedExperiment] = useState(experiment)
    const [isDirty, setDirty] = useState(false)
    const [isSnackbarOpen, setSnackbarOpen] = useState(false)

    useEffect(() => {
        if (lastSavedExperiment && JSON.stringify(lastSavedExperiment) !== JSON.stringify(experiment)) {
            setDirty(true)
        }
    }, [experiment])

    const onSave = async () => {
        try {
            await saveExperiment(experiment)
            setLastSavedExperiment(experiment)
            setDirty(false)
            setSnackbarOpen(true)
        } catch (error) {
            console.error('fetch error', error)
        }
    }

    const onRun = async () => {
        try {
            await runExperiment(dispatch, experiment)
            setDirty(true)
            //setSnackbarOpen(true)
        } catch (error) {
            console.error('fetch error', error)
        }

    }

    function handleCloseSnackbar() {
        setSnackbarOpen(false)
    }

    const valueVariables = experiment.valueVariables
    const categoricalVariables = experiment.categoricalVariables
    if (loading) {
        return <>Loading experiment...</>
    }
    return (
        <Layout>
            <Card className={[classes.experimentContainer, isDirty ? classes.experimentContainerDirty : ''].join(' ')}>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="body2">
                                {experiment.id}
                            </Typography>
                            <Typography variant="h4" gutterBottom>
                                {/* Experiment {experiment.id} {isDirty && '(unsaved)'} [{experiment.results.rawResult || 'No results'}]  */}
                                {experiment.info.name} {isDirty && '(unsaved)'}
                            </Typography>
                        </Grid>

                        <Grid item xs={2} className={classes.actionContainer}>
                            <Button variant="contained" className={isDirty ? classes.saveButtonDirty : ''} onClick={onSave} color="primary">Save</Button>
                            <Button variant="contained" className={classes.runButton} color="primary" onClick={onRun}>Run</Button>
                        </Grid>
                        <Grid item xs={3}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <ModelEditor
                                        info={experiment.info}
                                        updateName={(name: string) => dispatch({ type: 'updateExperimentName', payload: name })}
                                        updateDescription={(description: string) => dispatch({ type: 'updateExperimentDescription', payload: description })} />
                                </Grid>

                                <Grid item xs={12}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6">
                                                Next experiment
                                            </Typography>
                                            <Typography variant="body2">
                                                {experiment.results.next && experiment.results.next.join(',')}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid item xs={12}>
                                    <OptimizerConfigurator
                                        config={experiment.optimizerConfig}
                                        onConfigUpdated={(config: OptimizerConfig) => dispatch({ type: 'updateConfiguration', payload: config })} />
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item xs={8} lg={7}>

                            <Grid container spacing={2}>
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
                                    <DataPoints
                                        experiment={experiment}
                                        onUpdateDataPoints={(dataPoints: DataPointType[][]) => dispatch({ type: 'updateDataPoints', payload: dataPoints })} />
                                </Grid>
                                <Grid item xs={12}>
                                    {experiment.results.plots.length > 0 &&
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    Plots
                                                </Typography>
                                                <ul>
                                                    {experiment.results.plots && experiment.results.plots.map(plot => <li key={plot.id}><img src={`data:image/png;base64, ${plot.plot}`} alt={plot.id}></img></li>)}
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    }
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={2}></Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={isSnackbarOpen}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="success">Experiment saved</Alert>
            </Snackbar>

        </Layout>
    )
}