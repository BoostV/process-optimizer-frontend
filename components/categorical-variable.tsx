import { Button, TextField, Typography } from '@material-ui/core';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CategoricalVariableType } from '../types/common';
import CategoricalVariableOptions from './categorical-variable-options';

type Inputs = {
  name: string;
  description: string;
  options: string[];
  order: string;
};

type CategoricalVariableProps = {
  onAdded: (data: CategoricalVariableType) => void
}

export default function CategoricalVariable(props: CategoricalVariableProps) {
  const [options, setOptions] = useState([])

  const { register, handleSubmit, reset, watch, errors } = useForm<CategoricalVariableType>();
  const onSubmit = async (data: CategoricalVariableType) => {
    props.onAdded({...data, options})
    setOptions([])
    reset()
  }

  return (
      <>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField 
            name="name" 
            label="Name"
            inputRef={register}
            />
            <br />
            <br />
          <TextField
            name="description"
            label="Description"
            inputRef={register}
          />
          <br />
          <br />
          <Typography>Options</Typography>

          {options.map((item, index) => (
            <div key={index}>
              {item}
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
