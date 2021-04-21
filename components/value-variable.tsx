import { Button, TextField } from '@material-ui/core'
import { useForm } from 'react-hook-form';
import { ValueVariableType } from '../types/common';

type ValueVariableProps = {
  onAdded: (data: ValueVariableType) => void
}

export default function ValueVariable(props: ValueVariableProps) {

  const { register, handleSubmit, reset, watch, errors } = useForm<ValueVariableType>();
  const onSubmit = async (data: ValueVariableType) => {
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
          <Button variant="outlined" type="submit">Add variable</Button>
        </form>
      </>
  )
}