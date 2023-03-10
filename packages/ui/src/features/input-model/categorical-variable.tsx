import { Box, Button, IconButton, TextField, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { useState, useCallback, useEffect } from 'react'
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
  editingVariable?: CategoricalVariableType
  onAdded: (data: CategoricalVariableType) => void
  onCancel: () => void
}

export default function CategoricalVariable(props: CategoricalVariableProps) {
  const { classes } = useStyles()

  const {
    valueVariables,
    categoricalVariables,
    editingVariable,
    onAdded,
    onCancel,
  } = props

  const [options, setOptions] = useState<string[]>([])

  const { register, handleSubmit, reset, formState, setError, clearErrors } =
    useForm<CategoricalVariableType>()

  const isOptionsValid = useCallback(() => {
    return options.length > 0
  }, [options])

  const onSubmit = (data: CategoricalVariableType) => {
    if (isOptionsValid()) {
      onAdded({ ...data, options })
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

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset()
      setOptions([])
    }
  }, [formState, reset, isOptionsValid])

  useEffect(() => {
    if (editingVariable !== undefined) {
      setOptions(editingVariable.options)
    }
    reset(
      editingVariable !== undefined
        ? {
            description: editingVariable.description,
            name: editingVariable.name,
            options: editingVariable.options,
          }
        : {
            description: '',
            name: '',
            options: [],
          }
    )
  }, [editingVariable, reset])

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          {...register('name', {
            ...validation.required,
            validate: (name: string, _: unknown) =>
              isValidVariableName(valueVariables, categoricalVariables, name),
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
                  <DeleteIcon fontSize="small" />
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
              ? formState.errors.options[0]?.message ?? ''
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
