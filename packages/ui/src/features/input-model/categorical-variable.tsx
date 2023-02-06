import { Box, Button, IconButton, TextField, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import CategoricalVariableOptions from './categorical-variable-options'
import { useStyles } from './categorical-variable.style'
import { validation } from '@ui/common/forms'
import { CategoricalVariableType } from '@process-optimizer-frontend/core'

type CategoricalVariableProps = {
  isDisabled: boolean
  onAdded: (data: CategoricalVariableType) => void
}

export default function CategoricalVariable(props: CategoricalVariableProps) {
  const { classes } = useStyles()
  const { isDisabled, onAdded } = props
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

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          {...register('name', { ...validation.required })}
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
          <Button
            disabled={isDisabled}
            size="small"
            variant="outlined"
            type="submit"
          >
            Add variable
          </Button>
        </Box>
      </form>
    </>
  )
}
