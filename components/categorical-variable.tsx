import { Box, Button, IconButton, TextField, Typography } from '@material-ui/core';
import DeleteIcon from "@material-ui/icons/Delete";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import CategoricalVariableOptions from './categorical-variable-options';
import { useStyles } from '../styles/categorical-variable.style';
import { CategoricalVariableType } from '../types/common';

type CategoricalVariableProps = {
  isDisabled: boolean
  onAdded: (data: CategoricalVariableType) => void
}

export default function CategoricalVariable(props: CategoricalVariableProps) {
  const classes = useStyles()
  const [options, setOptions] = useState([])
  const { isDisabled, onAdded } = props

  const { register, handleSubmit, reset, watch, errors } = useForm<CategoricalVariableType>();
  const onSubmit = async (data: CategoricalVariableType) => {
    onAdded({...data, options})
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
          <TextField 
            fullWidth
            margin="dense"
            name="name" 
            label="Name"
            inputRef={register}
            />
          <TextField
            fullWidth
            margin="dense"
            name="description"
            label="Description"
            inputRef={register}
          />
          
          <Box mt={2}>
            <Typography>Options</Typography>
            {options.map((option, index) => (
              <div key={index}>
                <div className={classes.option}>
                  <Typography variant="body1">{option}</Typography>
                  <IconButton onClick={() => deleteOption(index)} size="small" aria-label="delete" color="primary">
                    <DeleteIcon /> 
                  </IconButton>
                </div>
              </div>
            ))}
          </Box>

          <CategoricalVariableOptions onOptionAdded={(option: String) => {
            setOptions([...options, option])
          }}/>
          
          <Box mt={1}>
            <Button disabled={isDisabled} variant="outlined" type="submit">Add</Button>
          </Box>
          
        </form>
    </>
  )
}
