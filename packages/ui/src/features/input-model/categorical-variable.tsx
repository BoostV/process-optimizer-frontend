import { Box, Button, IconButton, TextField, Typography } from '@mui/material'
import { Delete } from '@mui/icons-material'
import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import CategoricalVariableOptions from './categorical-variable-options'
import { useStyles } from './categorical-variable.style'
import { isValidVariableName, validation } from '@ui/common/forms'
import {
  CategoricalVariableType,
  ValueVariableType,
} from '@boostv/process-optimizer-frontend-core'

type CategoricalVariableProps = {
  valueVariables: ValueVariableType[]
  categoricalVariables: CategoricalVariableType[]
  editingVariable?: {
    index: number
    variable: CategoricalVariableType
  }
  onAdd: (data: CategoricalVariableType) => void
  onEdit: (newVariable: CategoricalVariableType) => void
  onCancel: () => void
}

export default function CategoricalVariable(props: CategoricalVariableProps) {
  const { classes } = useStyles()

  const {
    valueVariables,
    categoricalVariables,
    editingVariable,
    onAdd,
    onEdit,
    onCancel,
  } = props

  const [options, setOptions] = useState<string[]>(
    editingVariable?.variable.options ?? []
  )

  const { register, handleSubmit, reset, formState, setError, clearErrors } =
    useForm<CategoricalVariableType>({
      defaultValues: editingVariable?.variable,
    })

  const isOptionsValid = useCallback(() => {
    return options.length > 0
  }, [options])

  const onSubmit = (data: CategoricalVariableType) => {
    if (isOptionsValid()) {
      const newVariable: CategoricalVariableType = {
        ...data,
        options,
        enabled: true,
      }
      if (editingVariable !== undefined) {
        onEdit(newVariable)
      } else {
        onAdd(newVariable)
      }
      clearErrors('options')
    } else {
      setError('options.0', {
        type: 'manual',
        message: 'Required',
      })
    }
  }

  const deleteOption = (index: number) => {
    const newOptions = options.slice()
    newOptions.splice(index, 1)
    setOptions(newOptions)
  }

  if (formState.isSubmitSuccessful) {
    reset()
    setOptions([])
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          {...register('name', {
            ...validation.required,
            validate: (name: string) =>
              isValidVariableName(
                valueVariables,
                categoricalVariables,
                name,
                'categorical',
                editingVariable?.index
              ),
          })}
          label="Name"
          fullWidth
          margin="dense"
          defaultValue=""
          error={!!formState.errors.name}
          helperText={formState.errors.name?.message}
        />
        <TextField
          {...register('description')}
          label="Description"
          fullWidth
          margin="dense"
          defaultValue=""
        />
        <Box mt={2}>
          <Typography>Options</Typography>
          {options.map((option, index) => (
            <div key={index}>
              <div className={classes.option}>
                <Typography variant="body1">{option}</Typography>
                <IconButton
                  onClick={() => deleteOption(index)}
                  size="small"
                  aria-label="delete"
                  color="primary"
                >
                  <Delete fontSize="small" />
                </IconButton>
              </div>
            </div>
          ))}
        </Box>
        <CategoricalVariableOptions
          onOptionAdded={(option: string) => {
            setOptions([...options, option])
            clearErrors('options')
          }}
          error={
            formState.errors.options !== undefined
              ? (formState.errors.options[0]?.message ?? '')
              : ''
          }
        />
        <Box mt={2}>
          <Box mr={1} display="inline">
            <Button size="small" variant="outlined" type="submit">
              {editingVariable !== undefined ? 'Save' : 'Add'}
            </Button>
          </Box>
          <Button size="small" variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        </Box>
      </form>
    </>
  )
}
