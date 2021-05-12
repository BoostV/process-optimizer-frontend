import { Box, Button, TextField } from '@material-ui/core'
import { useForm } from 'react-hook-form';
import { ValueVariableType } from '../types/common';

type ValueVariableProps = {
  isDisabled: boolean
  onAdded: (data: ValueVariableType) => void
}

export default function ValueVariable(props: ValueVariableProps) {
  const { isDisabled, onAdded } = props

  const { register, handleSubmit, reset, watch, errors } = useForm<ValueVariableType>();
  const onSubmit = async (data: ValueVariableType) => {
    onAdded(data)
    reset()
  }

  return (
      <>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            fullWidth
            margin="dense"
            name="name" 
            label="Name" 
            inputRef={register}
            />
          <TextField
            fullWidth
            margin="dense"
            name="description"
            label="Description"
            inputRef={register}
          />
          <TextField
            fullWidth
            margin="dense"
            name="minVal"
            label="minVal"
            inputRef={register}
          />
          <TextField
            fullWidth
            margin="dense"
            name="maxVal"
            label="maxVal"
            inputRef={register}
          />
          <Box mt={1} mb={2}>
            <Button disabled={isDisabled} variant="outlined" type="submit">Add</Button>
          </Box>
        </form>
      </>
  )
}