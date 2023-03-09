import { Box, Button } from '@mui/material'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import useStyles from './value-variable.style'
import { FormRadioGroup } from '@ui/common'
import { isValidValueVariableName, validation } from '@ui/common/forms'
import {
  ValueVariableInputType,
  ValueVariableType,
} from '@boostv/process-optimizer-frontend-core'
import FormInputText from '@ui/common/forms/form-input'

type ValueVariableProps = {
  isDisabled: boolean
  valueVariables: ValueVariableType[]
  onAdded: (data: ValueVariableType) => void
}

export default function ValueVariable(props: ValueVariableProps) {
  const { isDisabled, valueVariables, onAdded } = props
  const { classes } = useStyles()
  const defaultValues: ValueVariableInputType = {
    name: '',
    min: '',
    max: '',
    description: '',
    type: 'continuous',
  }
  const { handleSubmit, reset, control, formState, getValues } =
    useForm<ValueVariableInputType>({
      defaultValues,
    })

  const onSubmit = (data: ValueVariableInputType) => {
    const noCommaMin = data.min.replace(',', '.')
    const noCommaMax = data.max.replace(',', '.')
    onAdded({
      ...data,
      min:
        data.type === 'discrete'
          ? Math.floor(parseFloat(noCommaMin))
          : parseFloat(noCommaMin),
      max:
        data.type === 'discrete'
          ? Math.floor(parseFloat(noCommaMax))
          : parseFloat(noCommaMax),
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
          rules={{
            ...validation.required,
            validate: (name: string, _: ValueVariableInputType) =>
              isValidValueVariableName(valueVariables, name),
          }}
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
