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

const fetcher = async (url: string) => (await fetch(url)).json();

type Inputs = {
  name: string;
  description: string;
};

type CategoricalVariable = {
  name: string;
  description: string;
  minVal: string;
  maxVal: string;
  order: string;
}

type ValueVariable = {
  name: string;
  description: string;
  options: Option[];
  order: string;
}

type Option = {
  value: string;
}

type Experiment = {
  name: string;
  description: string;
  categoricalVariables: CategoricalVariable[];
  valueVariables: ValueVariable[];
}

export default function Experiment() {
  const router = useRouter()
  const { experimentid } = router.query
  const { data: experiment, error } = useSwr(`/api/experiment/${experimentid}`, fetcher);
  const classes = useStyles();
  const { register, handleSubmit, watch, errors } = useForm<Inputs>();
  //const onSubmit = async (data: Inputs) => fetch(`/api/experiment/${experimentid}`, {method: 'PUT', body: JSON.stringify(data)})
  const onSubmit = async (data: Inputs) => console.log('submit', JSON.stringify(data), state)

  let initialState: Experiment = {
    name: "",
    description: "",
    categoricalVariables: [],
    valueVariables: [],
  }

  type CategoricalVariableAddedAction = {
    type: 'CATEGORICAL_VARIABLE_ADDED',
    payload: CategoricalVariable 
  }

  type ValueVariableAddedAction = {
    type: 'VALUE_VARIABLE_ADDED',
    payload: ValueVariable 
  }

  type Action = CategoricalVariableAddedAction | ValueVariableAddedAction

  const reducer = (state: Experiment, action: Action) => {
    if (action.type == 'CATEGORICAL_VARIABLE_ADDED') {
      console.log('CATEGORICAL_VARIABLE_ADDED', state)
      state.categoricalVariables.push(action.payload)
      return state
    }
  }

  //TODO: Set initial state to experiment -> third param of useReducer?
  const [state, dispatch] = useReducer(reducer, initialState)

  function addCategoricalVariable(categoricalVariable: CategoricalVariable) {
    dispatch({ type: 'CATEGORICAL_VARIABLE_ADDED', payload: categoricalVariable });
  }

  if (error) return <div>Failed to load experiment</div>;
  if (!experiment) return <div>Loading...</div>;

  return (
    <Layout>
      <Card className={classes.experimentContainer}>
        <CardContent>

          <Button onClick={() => {addCategoricalVariable({name: 'n', description: 'd', minVal: '1', maxVal: '2', order: '1'})}}>Reducer dummy button</Button>

          <Grid container spacing={3}>
            <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>
                Experiment {experiment.id} - {experiment.name} 
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Card>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <TextField name="name" label="Name" required inputRef={register}/>
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
                    <Card>
                      <CardContent>
                        <VariableCategorical />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent>
                        <VariableValue />
                      </CardContent>
                    </Card>
                    <br />
                    <br />
                    <Button type="submit" variant="contained">Save</Button>
                  </form>
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