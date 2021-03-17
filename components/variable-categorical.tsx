import { Button, TextField, Typography } from '@material-ui/core'

type VariableCategoricalInputs = {
  name: string;
  description: string;
  minVal: string;
  maxVal: string;
  order: string;
};

type VariableCategoricalProps = {}

export default function VariableCategorical(props: VariableCategoricalProps) {
  return (
      <>
        <Typography variant="h6" gutterBottom>
          Add new variable (categorical)
        </Typography>
          <TextField 
            name="name" 
            label="Name" 
            />
            <br />
            <br />
          <TextField
            name="description"
            label="Description"
          />
          <br />
          <br />
          <TextField
            name="minVal"
            label="minVal"
          />
          <br />
          <br />
          <TextField
            name="maxVal"
            label="maxVal"
          />
          <br />
          <br />
          <TextField
            name="order"
            label="Order"
          />
          <br />
          <br />
          <Button variant="outlined">Add variable</Button>
      </>
  )
}
