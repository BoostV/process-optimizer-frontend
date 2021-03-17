import { Button, TextField, Typography } from '@material-ui/core';

type Inputs = {
  name: string;
  description: string;
  options: string[];
  order: string;
};

type VariableValueProps = {}

export default function VariableValue(props: VariableValueProps) {

  return (
      <>
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
        <Typography>Options</Typography>
        <TextField
          name="option"
          label="Option"
        />
        <br />
        <Button variant="outlined" onClick={() => console.log('add option')} size="small">Add option</Button>
        <br />
        <br />
        <Button type="submit" variant="outlined">Add variable</Button>
    </>
  )
}
