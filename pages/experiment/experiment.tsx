import { Card, CardContent, TextareaAutosize, TextField, Typography } from '@material-ui/core'
import Layout from '../../components/layout'
import { useStyles } from '../../styles/experiment.style';

export default function Experiment() {
  const classes = useStyles();

  return (
    <Layout>
      <Card className={classes.experimentContainer}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Experiment
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
