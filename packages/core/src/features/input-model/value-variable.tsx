import { Box, Button } from '@mui/material'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import useStyles from './value-variable.style'
import FormInputText from '@/common/util/forms/form-input'
import { FormRadioGroup } from '@/common/util/forms/form-radio-group'
import { validation } from '@/common/util/forms/validation'
import { ValueVariableInputType, ValueVariableType } from '@/common/types'

type ValueVariableProps = {
  isDisabled: boolean
  onAdded: (data: ValueVariableType) => void
}

export default function ValueVariable(props: ValueVariableProps) {
  const { isDisabled, onAdded } = props
  const { classes } = useStyles()
  const defaultValues: ValueVariableInputType = useMemo(() => {
    return { name: '', min: '', max: '', description: '', type: 'continuous' }
  }, [])
  const { handleSubmit, reset, control, formState, getValues } = useForm({
    defaultValues,
  })

  const onSubmit = (data: ValueVariableInputType) => {
    onAdded({
      ...data,
      min:
        data.type === 'discrete'
          ? Math.floor(parseFloat(data.min))
          : parseFloat(data.min),
      max:
        data.type === 'discrete'
          ? Math.floor(parseFloat(data.max))
          : parseFloat(data.max),
    })
  }

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset({ ...defaultValues, type: getValues().type })
    }
  }, [defaultValues, formState, reset, getValues])

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormInputText
          name="name"
          control={control}
          fullWidth
          margin="dense"
          label="Name"
          rules={validation.required}
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
              rules={{ ...validation.required, ...validation.mustBeNumber }}
            />
          </Box>
          <Box className={classes.narrowInput}>
            <FormInputText
              name="max"
              control={control}
              fullWidth
              margin="dense"
              label="Max"
              rules={{ ...validation.required, ...validation.mustBeNumber }}
            />
          </Box>
        </Box>
        <Box mt={1} mb={1}>
          <FormRadioGroup
            name="type"
            control={control}
            values={['continuous', 'discrete']}
            labels={['Continuous', 'Discrete']}
            tooltips={[
              'Values include non-integers',
              'Values are only integers',
            ]}
            ariaLabel={'value-type'}
          />
        </Box>
        <Button
          size="small"
          disabled={isDisabled}
          variant="outlined"
          type="submit"
        >
          Add variable
        </Button>
      </form>
    </>
  )
}
