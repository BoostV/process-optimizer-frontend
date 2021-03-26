import { useRouter } from 'next/router'
import useSwr from "swr";
import { Button, Card, CardContent, Grid, Radio, TextField, Typography } from '@material-ui/core'
import Layout from '../../components/layout'
import { useStyles } from '../../styles/experiment.style';
import ValueVariable from '../../components/value-variable';
import CategoricalVariable from '../../components/categorical-variable';
import OptimizerModel from '../../components/optimizer-model';
import OptimizerConfigurator from '../../components/optimizer-configurator';
import { ChangeEvent, useReducer, useState } from 'react';
import { VALUE_VARIABLE_ADDED, EXPERIMENT_DESCRIPTION_UPDATED, EXPERIMENT_NAME_UPDATED, EXPERIMENT_UPDATED, rootReducer, VALUE_VARIABLE_DELETED } from '../../reducers/reducers';
import { ValueVariableType, ExperimentType } from '../../types/common';
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
      }
    });
  const classes = useStyles();

  const [radioIndex, setRadioIndex] = useState(0)

  const onSave = async () => {
    fetch(`/api/experiment/${experimentid}`, {method: 'PUT', body: JSON.stringify(state.experiment)})
  }

  const [state, dispatch] = useReducer(rootReducer, initialState)

  function addValueVariable(valueVariable: ValueVariableType) {
    dispatch({ type: VALUE_VARIABLE_ADDED, payload: valueVariable })
  }

  function deleteValueVariable(valueVariable: ValueVariableType) {
    dispatch({ type: VALUE_VARIABLE_DELETED, payload: valueVariable })
  }

  function updateExperiment(experiment: ExperimentType) {
    dispatch({ type: EXPERIMENT_UPDATED, payload: experiment})
  }

  function updateName(name: String) {
    dispatch({ type: EXPERIMENT_NAME_UPDATED, payload: name})
  }

  function updateDescription(description: String) {
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
                Experiment {state.experiment.id}
              </Typography>
            </Grid>
            <Grid item xs={4}>
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
                        <Grid item xs={6}>
                          <Radio
                            checked={radioIndex === 0}
                            onChange={() => {setRadioIndex(0)}}
                          />
                          <Typography>Value</Typography>
                        </Grid>
                        <Grid item xs={6}>
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
                            <CategoricalVariable />
                          }
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                  <br />
                  <br />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card>
                <CardContent>
                  <OptimizerModel 
                    experiment={state.experiment}
                    onDeleteValueVariable={(valueVariable: ValueVariableType) => {deleteValueVariable(valueVariable)}} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card>
                <CardContent>
                  <OptimizerConfigurator />
                </CardContent>
              </Card>
            </Grid>
            <Button variant="contained" onClick={onSave}>Save</Button>
          </Grid>
        </CardContent>
      </Card>
    </Layout>
  )
}