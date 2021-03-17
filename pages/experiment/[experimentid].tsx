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
import { experimentReducer } from '../../reducers/reducers';

const fetcher = async (url: string) => (await fetch(url)).json();

export type CategoricalVariable = {
  name: string;
  description: string;
  minVal: string;
  maxVal: string;
  order: string;
}

export type ValueVariable = {
  name: string;
  description: string;
  options: Option[];
  order: string;
}

type Option = {
  value: string;
}

export type Experiment = {
  id: string | undefined,
  info: Info;
  categoricalVariables: CategoricalVariable[];
  valueVariables: ValueVariable[];
}

export type Info = {
  name: string;
  description: string;
}

export default function Experiment() {
  const router = useRouter()
  const { experimentid } = router.query
  const { data: experiment, error } = useSwr(`/api/experiment/${experimentid}`, fetcher);
  const classes = useStyles();
  const { register, handleSubmit, watch, errors } = useForm<Info>();

  const [tabIndex, setTabIndex] = useState(0)
  
  //TODO: Reducer may not be done updated before data is submitted
  const onSubmit = async (data: Info) => {
    saveExperiment(data)
    fetch(`/api/experiment/${experimentid}`, {method: 'PUT', body: JSON.stringify(state)})
  }

  let initialState: Experiment = {
    id: "",
    info: {
      name: "",
      description: "",
    },
    categoricalVariables: [],
    valueVariables: [],
  }

  const [state, dispatch] = useReducer(experimentReducer, initialState)

  function addCategoricalVariable(categoricalVariable: CategoricalVariable) {
    dispatch({ type: 'CATEGORICAL_VARIABLE_ADDED', payload: categoricalVariable })
  }

  function saveExperiment(info: Info) {
    dispatch({ type: 'EXPERIMENT_SAVED', payload: info})
  }

  function loadExperiment(experiment: Experiment) {
    dispatch({ type: 'EXPERIMENT_LOADED', payload: experiment})
  }

  function loadOrCreateExperiment() {
    if (experiment !== undefined) {
      let loadedExperiment: Experiment = experiment
      if (experiment.info === undefined) {
        loadedExperiment = {
          ...initialState,
          id: experiment.id
        }
      }
      loadExperiment(loadedExperiment)  
   }
  }

  useEffect(() => {
    loadOrCreateExperiment()
  }, [experiment])

  if (error) return <div>Failed to load experiment</div>;
  if (!experiment) return <div>Loading...</div>;

  return (
    <Layout>
      <Card className={classes.experimentContainer}>
        <CardContent>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h4" gutterBottom>
                Experiment {state.id} - {state.info.name} 
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
                            checked={tabIndex === 0}
                            onChange={() => {setTabIndex(0)}}
                          />
                          <Typography>Categorical</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Radio
                            checked={tabIndex === 1}
                            onChange={() => {setTabIndex(1)}}
                          />
                          <Typography>Value</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <br/>
                          <br/>
                          {tabIndex === 0 &&
                            <VariableCategorical onAdded={(data: CategoricalVariable) => addCategoricalVariable(data)} />
                          }
                          {tabIndex === 1 &&
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
                  <OptimizerModel experiment={state}/>
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
    </Layout>
  )
}