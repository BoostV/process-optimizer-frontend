import { Button, TextField, Typography } from '@material-ui/core';
import { useForm } from 'react-hook-form';
import { CategoricalVariableType } from '../types/common';

type Inputs = {
  name: string;
  description: string;
  options: string[];
  order: string;
};

type CategoricalVariableProps = {
  onAdded: (data: CategoricalVariableType) => void
}

export default function CategoricalVariable(props: CategoricalVariableProps) {

  const { register, handleSubmit, reset, watch, errors } = useForm<CategoricalVariableType>();
  const onSubmit = async (data: CategoricalVariableType) => {
    props.onAdded(data)
    reset()
  }

  return (
      <>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField 
            name="name" 
            label="Name"
            inputRef={register}
            />
            <br />
            <br />
          <TextField
            name="description"
            label="Description"
            inputRef={register}
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
        </form>
    </>
  )
}
