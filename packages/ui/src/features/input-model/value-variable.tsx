import { Box, Button } from '@mui/material'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import useStyles from './value-variable.style'
import { FormRadioGroup } from '@ui/common'
import { isValidVariableName, validation } from '@ui/common/forms'
import {
  ValueVariableInputType,
  CategoricalVariableType,
  ValueVariableType,
} from '@boostv/process-optimizer-frontend-core'
import FormInputText from '@ui/common/forms/form-input'

type ValueVariableProps = {
  valueVariables: ValueVariableType[]
  categoricalVariables: CategoricalVariableType[]
  editingVariable?: ValueVariableType
  onAdded: (data: ValueVariableType) => void
  onCancel: () => void
}

export default function ValueVariable(props: ValueVariableProps) {
  const {
    valueVariables,
    categoricalVariables,
    editingVariable,
    onAdded,
    onCancel,
  } = props

  const { classes } = useStyles()

  const emptyValues: ValueVariableInputType = {
    name: '',
    min: '',
    max: '',
    description: '',
    type: 'continuous',
  }

  const { handleSubmit, reset, control, formState, getValues } =
    useForm<ValueVariableInputType>({
      defaultValues: emptyValues,
    })

  useEffect(() => {
    reset(
      editingVariable !== undefined
        ? {
            name: editingVariable.name,
            min: '' + editingVariable.min,
            max: '' + editingVariable.max,
            description: editingVariable.description,
            type: editingVariable.type,
          }
        : emptyValues
    )
  }, [editingVariable, reset])

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset({ ...emptyValues, type: getValues().type })
    }
  }, [emptyValues, formState.isSubmitSuccessful, reset, getValues])

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
            validate: (name: string, _: unknown) =>
              isValidVariableName(valueVariables, categoricalVariables, name),
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
        <Box mr={1} display="inline">
          <Button size="small" variant="outlined" type="submit">
            {editingVariable !== undefined ? 'Save' : 'Add'}
          </Button>
        </Box>
        <Button size="small" variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </form>
    </>
  )
}
