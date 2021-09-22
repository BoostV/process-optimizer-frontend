import { Box, Button, IconButton, Typography } from '@material-ui/core';
import DeleteIcon from "@material-ui/icons/Delete";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import CategoricalVariableOptions from './categorical-variable-options';
import { useStyles } from './categorical-variable.style';
import { CategoricalVariableType } from '../../types/common';
import { FormInputText } from '../../utility/forms';

type CategoricalVariableProps = {
  isDisabled: boolean
  onAdded: (data: CategoricalVariableType) => void
}

export default function CategoricalVariable(props: CategoricalVariableProps) {
  const classes = useStyles()
  const [options, setOptions] = useState([])
  const { isDisabled, onAdded } = props

  const { handleSubmit, reset, control } = useForm<CategoricalVariableType>();
  const onSubmit = async (data: CategoricalVariableType) => {
    onAdded({ ...data, options })
    setOptions([])
    reset()
  }

  function deleteOption(index: number) {
    let newOptions = options.slice()
    newOptions.splice(index, 1)
    setOptions(newOptions)
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

        <CategoricalVariableOptions onOptionAdded={(option: String) => {
          setOptions([...options, option])
        }} />

        <Box mt={2}>
          <Button disabled={isDisabled} size="small" variant="outlined" type="submit">Add variable</Button>
        </Box>

      </form>
    </>
  )
}
