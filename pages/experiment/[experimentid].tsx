import { useRouter } from 'next/router'
import useSwr from "swr";
import { Button, Card, CardContent, Grid, Radio, TextField, Typography } from '@material-ui/core'
import Layout from '../../components/layout'
import { useStyles } from '../../styles/experiment.style';
import { useForm } from "react-hook-form";
import VariableCategorical from '../../components/variable-categorical';
import VariableValue from '../../components/variable-value';
import OptimizerModel from '../../components/optimizer-model';
import OptimizerConfigurator from '../../components/optimizer-configurator';
import { useEffect, useReducer, useState } from 'react';
import { CATEGORICAL_VARIABLE_ADDED, EXPERIMENT_LOADED, EXPERIMENT_SAVED, rootReducer } from '../../reducers/reducers';
import { CategoricalVariable, ExperimentType, Info } from '../../types/common';
import { initialState } from '../../store';

const fetcher = async (url: string) => (await fetch(url)).json();

type ExperimentLoadResponse = {
  data?: ExperimentType
  error?: any
}

export default function Experiment() {
  const router = useRouter()
  const { experimentid } = router.query
  const { data: experiment, error }: ExperimentLoadResponse = useSwr(`/api/experiment/${experimentid}`, fetcher);
  const classes = useStyles();
  const { register, handleSubmit, watch, errors } = useForm<Info>();

  useEffect(() => {
    if (experiment !== undefined && experiment.info !== undefined) {
      loadExperiment(experiment) 
    }
  }, [experiment])

  const [radioIndex, setRadioIndex] = useState(0)
  
  //TODO: Reducer may not be done updating before data is submitted
  const onSubmit = async (data: Info) => {
    saveExperiment(data)
    fetch(`/api/experiment/${experimentid}`, {method: 'PUT', body: JSON.stringify(state)})
  }

  const [state, dispatch] = useReducer(rootReducer, initialState)

  function addCategoricalVariable(categoricalVariable: CategoricalVariable) {
    dispatch({ type: CATEGORICAL_VARIABLE_ADDED, payload: categoricalVariable })
  }

  function saveExperiment(info: Info) {
    dispatch({ type: EXPERIMENT_SAVED, payload: info})
  }

  function loadExperiment(experiment: ExperimentType) {
    dispatch({ type: EXPERIMENT_LOADED, payload: experiment})
  }

  if (error) return <div>Failed to load experiment</div>;
  if (!experiment) return <div>Loading...</div>;

  return (
    <Layout>
      {state.experiment.info !== undefined && 
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
                    <form id="experimentForm" onSubmit={handleSubmit(onSubmit)}>
                      <TextField 
                        name="name" 
                        label="Name" 
                        required
                        
                        inputRef={register}/>
                      <br/>
                      <br/>
                      <TextField
                        name="description"
                        label="Description"
                        required
                        inputRef={register}
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
                            <Typography>Categorical</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Radio
                              checked={radioIndex === 1}
                              onChange={() => {setRadioIndex(1)}}
                            />
                            <Typography>Value</Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <br/>
                            <br/>
                            {radioIndex === 0 &&
                              <VariableCategorical onAdded={(data: CategoricalVariable) => addCategoricalVariable(data)} />
                            }
                            {radioIndex === 1 &&
                              <VariableValue />
                            }
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                    <br />
                    <br />
                    <Button variant="contained" type="submit" form="experimentForm">Save</Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card>
                  <CardContent>
                    <OptimizerModel experiment={state.experiment}/>
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
            </Grid>

          </CardContent>
        </Card>
      }
    </Layout>
  )
}