import { Box, Button, IconButton, TextField, Typography } from '@material-ui/core';
import DeleteIcon from "@material-ui/icons/Delete";
import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CategoricalVariableOptions from './categorical-variable-options';
import { useStyles } from './categorical-variable.style';
import { CategoricalVariableType } from '../../types/common';

type CategoricalVariableProps = {
  isDisabled: boolean
  onAdded: (data: CategoricalVariableType) => void
}

export default function CategoricalVariable(props: CategoricalVariableProps) {
  const classes = useStyles()
  const { isDisabled, onAdded } = props
  const defaultValues: CategoricalVariableType = useMemo(() => { return { name: undefined, description: undefined, options: [] } }, [])
  const [options, setOptions] = useState(defaultValues.options)
  const { register, handleSubmit, reset, formState } = useForm<CategoricalVariableType>({ defaultValues })

  const onSubmit = (data: CategoricalVariableType) => {
    onAdded({ ...data, options })
  }

  function deleteOption(index: number) {
    let newOptions = options.slice()
    newOptions.splice(index, 1)
    setOptions(newOptions)
  }

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset({ ...defaultValues })
      setOptions(defaultValues.options)
    }
  }, [defaultValues, formState, reset])

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          name="name"
          { ...register("name") }
          label="Name"
          fullWidth
          margin="dense"
        />
        <TextField
          name="description"
          { ...register("description") }
          label="Description"
          fullWidth
          margin="dense"
        />
        <Box mt={2}>
          <Typography>Options</Typography>
          {options.map((option, index) => (
            <div key={index}>
              <div className={classes.option}>
                <Typography variant="body1">{option}</Typography>
                <IconButton onClick={() => deleteOption(index)} size="small" aria-label="delete" color="primary">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </div>
            </div>
          ))}
        </Box>
        <CategoricalVariableOptions onOptionAdded={(option: string) => {
          setOptions([...options, option])
        }} />
        <Box mt={2}>
          <Button disabled={isDisabled} size="small" variant="outlined" type="submit">Add variable</Button>
      </Box>
      </form>
    </>
  )
}
