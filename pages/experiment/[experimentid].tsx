import { useRouter } from 'next/router'
import useSwr from "swr";
import { Card, CardContent, TextareaAutosize, TextField, Typography } from '@material-ui/core'
import Layout from '../../components/layout'
import { useStyles } from '../../styles/experiment.style';
import { useForm } from "react-hook-form";
import VariableCategorical from '../../components/variable-categorical';

const fetcher = async (url: string) => (await fetch(url)).json();

type Inputs = {
  name: string,
  description: string,
};

export default function Experiment() {
  const router = useRouter()
  const { experimentid } = router.query
  const { data: experiment, error } = useSwr(`/api/experiment/${experimentid}`, fetcher);
  const classes = useStyles();
  const { register, handleSubmit, watch, errors } = useForm<Inputs>();
  const onSubmit = async (data: Inputs) => fetch(`/api/experiment/${experimentid}`, {method: 'PUT', body: JSON.stringify(data)})

  if (error) return <div>Failed to load experiment</div>;
  if (!experiment) return <div>Loading...</div>;

  return (
    <Layout>
      <Card className={classes.experimentContainer}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Experiment {experiment.id} - {experiment.name} 
          </Typography>
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
            <input type="submit" />
          </form>

          <VariableCategorical />

        </CardContent>
      </Card>
    </Layout>
  )
}
