import { useRouter } from 'next/router'
import useSwr from "swr";
import { Button, Card, CardContent, Grid, IconButton, Radio, Snackbar, TextField, Typography } from '@material-ui/core'
import Layout from '../../components/layout'
import { useStyles } from '../../styles/experiment.style';
import ValueVariable from '../../components/value-variable';
import CategoricalVariable from '../../components/categorical-variable';
import OptimizerModel from '../../components/optimizer-model';
import OptimizerConfigurator from '../../components/optimizer-configurator';
import { ChangeEvent, useEffect, useReducer, useState } from 'react';
import { VALUE_VARIABLE_ADDED, EXPERIMENT_DESCRIPTION_UPDATED, EXPERIMENT_NAME_UPDATED, EXPERIMENT_UPDATED, rootReducer, VALUE_VARIABLE_DELETED, CATEGORICAL_VARIABLE_ADDED, CATEGORICAL_VARIABLE_DELETED } from '../../reducers/reducers';
import { ValueVariableType, ExperimentType, CategoricalVariableType } from '../../types/common';
import { initialState } from '../../store';

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
  const [radioIndex, setRadioIndex] = useState(0)
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

  function handleCloseSnackbar() {
    setSnackbarOpen(false)
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

  if (error) return <div>Failed to load experiment</div>;
  if (!state.experiment.id) return <div>Loading...</div>;

  return (
    <Layout>
      <Card className={classes.experimentContainer}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h4" gutterBottom>
                Experiment {state.experiment.id} {isDirty && '(unsaved)'}
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Card>
                <CardContent>
                  <form>
                    <TextField 
                      name="name" 
                      label="Name" 
                      value={state.experiment.info.name}
                      required
                      onChange={(e: ChangeEvent) => updateName((e.target as HTMLInputElement).value)}
                    />
                    <br/>
                    <br/>
                    <TextField
                      name="info.description"
                      label="Description"
                      value={state.experiment.info.description}
                      required
                      onChange={(e: ChangeEvent) => updateDescription((e.target as HTMLInputElement).value)}
                    />
                    <br />
                    <br />
                  </form>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Add new variable
                      </Typography>
                      <Grid container spacing={0}>
                        <Grid item xs={3}>
                          <Radio
                            checked={radioIndex === 0}
                            onChange={() => {setRadioIndex(0)}}
                          />
                          <Typography>Value</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Radio
                            checked={radioIndex === 1}
                            onChange={() => {setRadioIndex(1)}}
                          />
                          <Typography>Categorical</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <br/>
                          <br/>
                          {radioIndex === 0 &&
                            <ValueVariable onAdded={(data: ValueVariableType) => addValueVariable(data)} />
                          }
                          {radioIndex === 1 &&
                            <CategoricalVariable onAdded={(data: CategoricalVariableType) => addCategoricalVariable(data)} />
                          }
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <OptimizerModel 
                    experiment={state.experiment as ExperimentType}
                    onDeleteValueVariable={(valueVariable: ValueVariableType) => {deleteValueVariable(valueVariable)}} 
                    onDeleteCategoricalVariable={(categoricalVariable: CategoricalVariableType) => {deleteCategoricalVariable(categoricalVariable)}}/>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={3}>
              <Card>
                <CardContent>
                  <OptimizerConfigurator config={state.experiment.optimizerConfig}/>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <br/>
          <br/>
          <Grid container spacing={3}>
            <Grid item xs={1}>
              <Button variant="contained" className={isDirty ? classes.saveButtonDirty : ''} onClick={onSave} color="primary">Save</Button>
            </Grid>
            <Grid item xs={1}>
              <Button variant="contained" color="primary" disabled>Run</Button>
            </Grid>
          </Grid>        
        </CardContent>
      </Card>
      
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={isSnackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="Experiment saved"
      />

    </Layout>
  )
}