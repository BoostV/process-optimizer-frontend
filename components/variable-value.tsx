import { Button, TextField, Typography } from '@material-ui/core';

type Inputs = {
  name: string,
  description: string,
  options: string[],
  order: string,
};

type VariableValueProps = {}

export default function VariableValue(props: VariableValueProps) {

  return (
      <>
        <Typography variant="h6" gutterBottom>
          Add new variable (value)
        </Typography>
        <TextField 
          name="name" 
          label="Name" 
          required 
          />
          <br />
          <br />
        <TextField
          name="description"
          label="Description"
          required
        />
        <br />
        <br />
        Options
        <br />
        <TextField
          name="option"
          label="Option"
          required
        />
        <br />
        <Button variant="outlined" onClick={() => console.log('click')} size="small">Add option</Button>
        <br />
        <br />
        <Button type="submit" variant="outlined">Add variable</Button>
    </>
  )
}
