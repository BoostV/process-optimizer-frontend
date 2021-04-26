import { Button, TextField } from '@material-ui/core'
import { useForm } from 'react-hook-form';
import { VariableType } from '../types/common';

type ValueVariableProps = {
  onAdded: (data: VariableType) => void
}

export default function ValueVariable(props: ValueVariableProps) {

  const { register, handleSubmit, reset, watch, errors } = useForm<VariableType>();
  const onSubmit = async (data: VariableType) => {
    props.onAdded(data)
    reset()
  }

  return (
      <>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            fullWidth
            name="name" 
            label="Name" 
            inputRef={register}
            />
            <br />
            <br />
          <TextField
            fullWidth
            name="description"
            label="Description"
            inputRef={register}
          />
          <br />
          <br />
          <TextField
            fullWidth
            name="minVal"
            label="minVal"
            inputRef={register}
          />
          <br />
          <br />
          <TextField
            fullWidth
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