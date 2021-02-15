import { useRouter } from 'next/router'
import useSwr from "swr";
import { Card, CardContent, TextareaAutosize, TextField, Typography } from '@material-ui/core'
import Layout from '../../components/layout'
import { useStyles } from '../../styles/experiment.style';

const fetcher = async (url: string) => (await fetch(url)).json();

export default function Experiment() {
  const router = useRouter()
  const { experimentid } = router.query
  const { data: experiment, error } = useSwr(`/api/experiment/${experimentid}`, fetcher);
  const classes = useStyles();

  if (error) return <div>Failed to load experiment</div>;
  if (!experiment) return <div>Loading...</div>;
  console.log(experiment)
  return (
    <Layout>
      <Card className={classes.experimentContainer}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Experiment {experiment.id} - {experiment.payload} 
          </Typography>
          <form>
            <TextField id="" label="Name" variant="outlined" required/>
            <br/>
            <br/>
            <TextField
              id=""
              label="Description"
              multiline
              variant="outlined"
              required
            />
          </form>
        </CardContent>
      </Card>
    </Layout>
  )
}
