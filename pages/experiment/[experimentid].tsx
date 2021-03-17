import { useRouter } from 'next/router'
import useSwr from "swr";
import { Button, Card, CardContent, Grid, TextField, Typography } from '@material-ui/core'
import Layout from '../../components/layout'
import { useStyles } from '../../styles/experiment.style';
import { useForm } from "react-hook-form";
import VariableCategorical from '../../components/variable-categorical';
import VariableValue from '../../components/variable-value';
import OptimizerModel from '../../components/optimizer-model';
import OptimizerConfigurator from '../../components/optimizer-configurator';
import { useReducer } from 'react';
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
  //const onSubmit = async (data: Inputs) => fetch(`/api/experiment/${experimentid}`, {method: 'PUT', body: JSON.stringify(data)})
  
  //TODO: How to submit data after reducer has updated it?
  const onSubmit = async (data: Info) => {
    saveExperiment(data)
    console.log('submit', JSON.stringify(data), state)
  }

  let initialState: Experiment = {
    info: {
      name: "",
      description: "",
    },
    categoricalVariables: [],
    valueVariables: [],
  }

  //TODO: Set initial state to experiment -> third param of useReducer?
  const [state, dispatch] = useReducer(experimentReducer, initialState)

  function addCategoricalVariable(categoricalVariable: CategoricalVariable) {
    dispatch({ type: 'CATEGORICAL_VARIABLE_ADDED', payload: categoricalVariable })
  }

  function saveExperiment(info: Info) {
    dispatch({ type: 'INFO_ADDED', payload: info})
  }

  if (error) return <div>Failed to load experiment</div>;
  if (!experiment) return <div>Loading...</div>;

  return (
    <Layout>
      <Card className={classes.experimentContainer}>
        <CardContent>

          <Grid container spacing={3}>
            <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>
                Experiment {experiment.id} - {experiment.name} 
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
                      <VariableCategorical onAdded={(data: CategoricalVariable) => addCategoricalVariable(data)} />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent>
                      <VariableValue />
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
                  <OptimizerModel />
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