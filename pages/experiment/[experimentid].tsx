import { useRouter } from 'next/router'
import useSwr from "swr";
import { Button, Card, CardContent, Grid, Snackbar, Typography } from '@material-ui/core'
import Layout from '../../components/layout'
import { useStyles } from '../../styles/experiment.style';
import OptimizerModel from '../../components/optimizer-model';
import OptimizerConfigurator from '../../components/optimizer-configurator';
import { useEffect, useReducer, useState } from 'react';
import { VALUE_VARIABLE_ADDED, EXPERIMENT_DESCRIPTION_UPDATED, EXPERIMENT_NAME_UPDATED, EXPERIMENT_UPDATED, rootReducer, VALUE_VARIABLE_DELETED, CATEGORICAL_VARIABLE_ADDED, CATEGORICAL_VARIABLE_DELETED, CONFIGURATION_UPDATED, RESULT_REGISTERED } from '../../reducers/reducers';
import { ValueVariableType, ExperimentType, CategoricalVariableType, OptimizerConfig, ExperimentResultType } from '../../types/common';
import { initialState } from '../../store';
import { Alert } from '@material-ui/lab';
import ModelEditor from '../../components/model-editor';

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

  function addValueVariable(valueVariable: ValueVariableType) {
    dispatch({ type: VALUE_VARIABLE_ADDED, payload: valueVariable })
  }

  function deleteValueVariable(valueVariable: ValueVariableType) {
    dispatch({ type: VALUE_VARIABLE_DELETED, payload: valueVariable })
  }
  
  function addCategoricalVariable(categoricalVariable: CategoricalVariableType) {
    dispatch({ type: CATEGORICAL_VARIABLE_ADDED, payload: categoricalVariable})
  }

  function deleteCategoricalVariable(categoricalVariable: CategoricalVariableType) {
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

  if (error) return <div>Failed to load experiment</div>;
  if (!state.experiment.id) return <div>Loading...</div>;

  return (
    <Layout>
      <Card className={[classes.experimentContainer, isDirty ? classes.experimentContainerDirty : ''].join(' ')}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h4" gutterBottom>
                {/* Experiment {state.experiment.id} {isDirty && '(unsaved)'} [{state.experiment.results.rawResult || 'No results'}]  */}
                Experiment {state.experiment.id} {isDirty && '(unsaved)'}
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <ModelEditor 
                info={state.experiment.info}
                updateName={(name: string) => updateName(name)}
                updateDescription={(description: string) => updateDescription(description)}
                addValueVariable={(valueVariable: ValueVariableType) => addValueVariable(valueVariable)}
                addCategoricalVariable={(categoricalVariable: CategoricalVariableType) => addCategoricalVariable(categoricalVariable)}/>
            </Grid>
            <Grid item xs={6}>
              <OptimizerModel 
                experiment={state.experiment}
                onDeleteValueVariable={(valueVariable: ValueVariableType) => {deleteValueVariable(valueVariable)}} 
                onDeleteCategoricalVariable={(categoricalVariable: CategoricalVariableType) => {deleteCategoricalVariable(categoricalVariable)}}/>
              <Card>
                <CardContent>
                  <ul>
                    {state.experiment.results.plots.map(plot =>  <li><img src={`data:image/png;base64, ${plot.plot}`} alt={plot.id}></img></li>)}
                  </ul>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={3}>
              <OptimizerConfigurator 
                config={state.experiment.optimizerConfig} 
                onConfigUpdated={(config: OptimizerConfig) => updateOptimizerConfiguration(config)}/>
                <Card>
                  <CardContent>
                  Next experiment: {state.experiment.results.next.join(',')}
                  </CardContent>
                </Card>
            </Grid>
          </Grid>
          <br/>
          <br/>
          <Grid container spacing={3}>
            <Grid item xs={1}>
              <Button variant="contained" className={isDirty ? classes.saveButtonDirty : ''} onClick={onSave} color="secondary">Save</Button>
            </Grid>
            <Grid item xs={1}>
              <Button variant="contained" color="secondary" onClick={onRun}>Run</Button>
            </Grid>
          </Grid>        
        </CardContent>
      </Card>

      <Snackbar open={isSnackbarOpen} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success">Experiment saved</Alert>
      </Snackbar>

    </Layout>
  )
}