import { Box, Button, Radio, FormControl, FormControlLabel, RadioGroup, Tooltip, TextField } from '@material-ui/core'
import { ChangeEvent, useState, useEffect, useMemo } from 'react';
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
  const defaultValues = useMemo(() => { return { name: '', min: '', max: '', description: '', type: 'continuous' } }, [])
  const [type, setType] = useState<string>(defaultValues.type)
  const { register, handleSubmit, reset, control, formState } = useForm({ defaultValues })

  const onSubmit = (data: ValueVariableType) => {
    onAdded(data)
  }

  const toggleDiscrete = (event: ChangeEvent<HTMLInputElement>) => {
    setType(event.target.value)
  }

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset({ ...defaultValues })
      setType(defaultValues.type)
    }
  }, [defaultValues, formState, reset])

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
              transform={e => parseFloat(e)}
            />
          </Box>
          <Box className={classes.narrowInput}>
            <FormInputText
              name="max"
              control={control}
              fullWidth
              margin="dense"
              label="Max"
              transform={e => parseFloat(e)}
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