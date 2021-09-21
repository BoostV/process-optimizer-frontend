import { Box, Button, TextField, Radio, FormControl, FormControlLabel, RadioGroup, Tooltip } from '@material-ui/core'
import { ChangeEvent, useState } from 'react';
import { useForm } from 'react-hook-form';
import useStyles from './value-variable.style';
import { ValueVariableType } from '../../types/common';
import { FormInputText } from '../../utility/forms';

type ValueVariableProps = {
  isDisabled: boolean
  onAdded: (data: ValueVariableType) => void
}

export default function ValueVariable(props: ValueVariableProps) {
  const { isDisabled, onAdded } = props
  const classes = useStyles()
  const [type, setType] = useState<string>('continuous')

  const { register, handleSubmit, reset, control } = useForm<ValueVariableType>()

  const onSubmit = async (data: ValueVariableType) => {
    onAdded(data)
    reset()
  }

  const toggleDiscrete = (event: ChangeEvent<HTMLInputElement>) => {
    setType(event.target.value)
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormInputText
          name="name"
          control={control}
          fullWidth
          margin="dense"
          label="Name"
        />
        <FormInputText
          name="description"
          control={control}
          fullWidth
          margin="dense"
          label="Description"
        />
        <Box mb={0} className={classes.narrowInputContainer}>
          <Box className={classes.narrowInput} pr={1}>
            <FormInputText
              name="min"
              control={control}
              fullWidth
              margin="dense"
              label="Min"
              rules={{valueAsNumber: true}}
            />
          </Box>
          <Box className={classes.narrowInput}>
            <FormInputText
              name="max"
              control={control}
              fullWidth
              margin="dense"
              label="Max"
              rules={{valueAsNumber: true}}
            />
          </Box>
        </Box>
        <Box mt={1} mb={1}>
          <FormControl component="fieldset">
            <RadioGroup row aria-label="value-type" name="type" value={type} onChange={toggleDiscrete}>
              <Tooltip title="Values include non-integers">
                <FormControlLabel {...register("type")} value="continuous" control={<Radio />} label="Continuous" />
              </Tooltip>
              <Tooltip title="Values are only integers">
                <FormControlLabel {...register("type")} value="discrete" control={<Radio />} label="Discrete" />
              </Tooltip>
            </RadioGroup>
          </FormControl>
        </Box>
        <Button size="small" disabled={isDisabled} variant="outlined" type="submit">Add variable</Button>
      </form>
    </>
  )
}