import { Button, TextField, Typography } from '@material-ui/core'
import { useForm } from 'react-hook-form';
import { CategoricalVariable } from '../types/common';

type VariableCategoricalProps = {
  onAdded: (data: CategoricalVariable) => void
}

export default function VariableCategorical(props: VariableCategoricalProps) {

  const { register, handleSubmit, watch, errors } = useForm<CategoricalVariable>();
  const onSubmit = async (data: CategoricalVariable) => props.onAdded(data)

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
          <TextField
            name="minVal"
            label="minVal"
            inputRef={register}
          />
          <br />
          <br />
          <TextField
            name="maxVal"
            label="maxVal"
            inputRef={register}
          />
          <br />
          <br />
          <TextField
            name="order"
            label="Order"
            inputRef={register}
          />
          <br />
          <br />
          <Button variant="outlined" type="submit">Add variable</Button>
        </form>
      </>
  )
}