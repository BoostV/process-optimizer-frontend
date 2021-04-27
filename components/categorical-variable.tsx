import { Button, IconButton, TextField, Typography } from '@material-ui/core';
import DeleteIcon from "@material-ui/icons/Delete";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { VariableType } from '../types/common';
import CategoricalVariableOptions from './categorical-variable-options';
import { useStyles } from '../styles/categorical-variable.style';

type CategoricalVariableProps = {
  onAdded: (data: VariableType) => void
}

export default function CategoricalVariable(props: CategoricalVariableProps) {
  const classes = useStyles()
  const [options, setOptions] = useState([])

  const { register, handleSubmit, reset, watch, errors } = useForm<VariableType>();
  const onSubmit = async (data: VariableType) => {
    props.onAdded({...data, options})
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
            name="name" 
            label="Name"
            inputRef={register}
            />
            <br />
            <br />
          <TextField
            fullWidth
            name="description"
            label="Description"
            inputRef={register}
          />
          <br />
          <br />
          
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

          <CategoricalVariableOptions onOptionAdded={(option: String) => {
            setOptions([...options, option])
          }}/>
          
          <br />
          <Button type="submit" variant="outlined">Add variable</Button>
        </form>
    </>
  )
}
