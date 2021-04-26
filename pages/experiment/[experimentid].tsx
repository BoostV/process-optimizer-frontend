import { useRouter } from 'next/router'
import useSwr from "swr";
import { Button, Card, CardContent, Grid, Snackbar, Typography } from '@material-ui/core'
import Layout from '../../components/layout'
import { useStyles } from '../../styles/experiment.style';
import OptimizerModel from '../../components/optimizer-model';
import OptimizerConfigurator from '../../components/optimizer-configurator';
import { useEffect, useReducer, useState } from 'react';
import { VALUE_VARIABLE_ADDED, EXPERIMENT_DESCRIPTION_UPDATED, EXPERIMENT_NAME_UPDATED, EXPERIMENT_UPDATED, rootReducer, VALUE_VARIABLE_DELETED, CATEGORICAL_VARIABLE_ADDED, CATEGORICAL_VARIABLE_DELETED, CONFIGURATION_UPDATED, RESULT_REGISTERED, DATA_POINTS_ADDED, DATA_POINTS_UPDATED } from '../../reducers/reducers';
import { VariableType, ExperimentType, OptimizerConfig, ExperimentResultType, DataPointType } from '../../types/common';
import { initialState } from '../../store';
import { Alert } from '@material-ui/lab';
import ModelEditor from '../../components/model-editor';
import DataPoints from '../../components/data-points';

const fetcher = async (url: string) => (await fetch(url)).json()

type ExperimentLoadResponse = {
  data?: ExperimentType
  error?: any
}

export default function Experiment() {
  const router = useRouter()
  const { experimentid } = router.query
  const { data: experiment, error }: ExperimentLoadResponse = useSwr(`/api/experiment/${experimentid}`, fetcher, 
    {
      onSuccess: (data: ExperimentType) => {
        updateExperiment(data)
      },
      revalidateOnFocus: false,
    });

  const classes = useStyles();
  const [state, dispatch] = useReducer(rootReducer, initialState)
  const [isDirty, setDirty] = useState(false)
  const [isSnackbarOpen, setSnackbarOpen] = useState(false)

  useEffect(() => {
    if (experiment && JSON.stringify(experiment) !== JSON.stringify(state.experiment)) {
      setDirty(true)
    }
  }, [state.experiment])

  const onSave = async () => {
    fetch(`/api/experiment/${experimentid}`, {method: 'PUT', body: JSON.stringify(state.experiment)}).then(
      (response: Response) => {
        setDirty(false)
        setSnackbarOpen(true)
      },
      (error: any) => console.error('fetch error', error)
    )
  }

  const onRun = async () => {
    try {
      const response: Response = await fetch(`/api/experiment/${experimentid}`, {method: 'POST', body: JSON.stringify(state.experiment)})
      const result: ExperimentResultType = await response.json()
          registerResult(result)
          setDirty(true)
          //setSnackbarOpen(true)
    } catch (error ){
      console.error('fetch error', error)
    }
    
  }

  function handleCloseSnackbar() {
    setSnackbarOpen(false)
  }

  function registerResult(result: ExperimentResultType) {
    dispatch({ type: RESULT_REGISTERED, payload: result })
  }

  function addValueVariable(valueVariable: VariableType) {
    dispatch({ type: VALUE_VARIABLE_ADDED, payload: valueVariable })
  }

  function deleteValueVariable(valueVariable: VariableType) {
    dispatch({ type: VALUE_VARIABLE_DELETED, payload: valueVariable })
  }
  
  function addCategoricalVariable(categoricalVariable: VariableType) {
    dispatch({ type: CATEGORICAL_VARIABLE_ADDED, payload: categoricalVariable})
  }

  function deleteCategoricalVariable(categoricalVariable: VariableType) {
    dispatch({ type: CATEGORICAL_VARIABLE_DELETED, payload: categoricalVariable })
  }

  function updateExperiment(experiment: ExperimentType) {
    dispatch({ type: EXPERIMENT_UPDATED, payload: experiment})
  }

  function updateName(name: string) {
    dispatch({ type: EXPERIMENT_NAME_UPDATED, payload: name})
  }

  function updateDescription(description: string) {
    dispatch({ type: EXPERIMENT_DESCRIPTION_UPDATED, payload: description})
  }

  function updateOptimizerConfiguration(config: OptimizerConfig) {
    dispatch({ type: CONFIGURATION_UPDATED, payload: config})
  }

  function updateDataPoints(dataPoints: DataPointType[][]) {
    dispatch({ type: DATA_POINTS_UPDATED, payload: dataPoints})
  }

  if (error) return <div>Failed to load experiment</div>;
  if (!state.experiment.id) return <div>Loading...</div>;

  return (
    <Layout>
      <Card className={[classes.experimentContainer, isDirty ? classes.experimentContainerDirty : ''].join(' ')}>
        <CardContent>
          <Grid container spacing={3}>
            
            <Grid item xs={10}>
              <Typography variant="body2">
                {state.experiment.id}
              </Typography>
              <Typography variant="h4" gutterBottom>
                {/* Experiment {state.experiment.id} {isDirty && '(unsaved)'} [{state.experiment.results.rawResult || 'No results'}]  */}
                {state.experiment.info.name} {isDirty && '(unsaved)'}
              </Typography>
            </Grid>
            
            <Grid item xs={2} className={classes.actionContainer}>
              <Button variant="contained" className={isDirty ? classes.saveButtonDirty : ''} onClick={onSave} color="primary">Save</Button>
              <Button variant="contained" className={classes.runButton} color="primary" onClick={onRun}>Run</Button>
            </Grid>

            <Grid item xs={3}>
              <ModelEditor 
                info={state.experiment.info}
                updateName={(name: string) => updateName(name)}
                updateDescription={(description: string) => updateDescription(description)} />
              <br/>
              <Card>
                <CardContent>
                  <Typography variant="h6">
                    Next experiment
                  </Typography>
                  <Typography variant="body2">
                    {state.experiment.results.next && state.experiment.results.next.join(',')}
                  </Typography>
                </CardContent>
              </Card>
              <br/>
              <OptimizerConfigurator 
                config={state.experiment.optimizerConfig} 
                onConfigUpdated={(config: OptimizerConfig) => updateOptimizerConfiguration(config)}/>
            </Grid>

            <Grid item xs={8} lg={7}>
              <OptimizerModel 
                experiment={state.experiment}
                onDeleteValueVariable={(valueVariable: VariableType) => {deleteValueVariable(valueVariable)}} 
                onDeleteCategoricalVariable={(categoricalVariable: VariableType) => {deleteCategoricalVariable(categoricalVariable)}}
                addValueVariable={(valueVariable: VariableType) => addValueVariable(valueVariable)}
                addCategoricalVariable={(categoricalVariable: VariableType) => addCategoricalVariable(categoricalVariable)}/>
              <br/>
              <DataPoints 
                experiment={state.experiment}
                onUpdateDataPoints={(dataPoints: DataPointType[][]) => updateDataPoints(dataPoints)}/>
              <br/>
              {state.experiment.results.plots.length > 0 &&
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Plots
                    </Typography>
                    <ul>
                      {state.experiment.results.plots && state.experiment.results.plots.map(plot =>  <li><img src={`data:image/png;base64, ${plot.plot}`} alt={plot.id}></img></li>)}
                    </ul>
                  </CardContent>
                </Card>
              }
            </Grid>
            <Grid item xs={2}></Grid>
          </Grid>
          <br/>
          <br/>        
        </CardContent>
      </Card>

      <Snackbar 
        anchorOrigin={{vertical:'top', horizontal: 'center'}} 
        open={isSnackbarOpen} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success">Experiment saved</Alert>
      </Snackbar>

    </Layout>
  )
}