import { Box, Button, TextField } from '@material-ui/core'
import { useForm } from 'react-hook-form';
import useStyles from '../styles/value-variable.style';
import { ValueVariableType } from '../types/common';

type ValueVariableProps = {
  isDisabled: boolean
  onAdded: (data: ValueVariableType) => void
}

type ValueVariableInput = {
  name: string
  description: string
  min: string
  max: string
}

export default function ValueVariable(props: ValueVariableProps) {
  const { isDisabled, onAdded } = props
  const classes = useStyles()

  const { register, handleSubmit, reset } = useForm<ValueVariableType>()
  
  const onSubmit = async (data: ValueVariableInput) => {
    const value: ValueVariableType = createValueVariable(data)
    onAdded(value)
    reset()
  }

  const createValueVariable = (input: ValueVariableInput): ValueVariableType => {
    const discrete = input.min.indexOf('.') === -1 && input.max.indexOf('.') === -1
    return {
      name: input.name,
      description: input.description,
      minVal: Number(input.min),
      maxVal: Number(input.max),
      discrete 
    }
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
          <Box mb={2} className={classes.narrowInputContainer}>
            <Box className={classes.narrowInput} pr={1}>
              <TextField
                fullWidth
                margin="dense"
                name="min"
                label="Min"
                inputRef={register}
              />
            </Box>
            <Box className={classes.narrowInput}>
              <TextField
                fullWidth
                margin="dense"
                name="max"
                label="Max"
                inputRef={register}
              />
            </Box>
          </Box>
          <Button size="small" disabled={isDisabled} variant="outlined" type="submit">Add variable</Button>
        </form>
      </>
  )
}