import { Button, TextField, Typography } from '@material-ui/core'
import { useForm } from "react-hook-form";

type Inputs = {
  name: string,
  description: string,
  options: string[]
  order: string,
};

type VariableValueProps = {
  onAdded: (data: Inputs) => void,
}

export default function Variablevalue(props: VariableValueProps) {
  const { register, handleSubmit, watch, errors } = useForm<Inputs>();
  const onHandleSubmit = async (data: Inputs) => props.onAdded(data)

  return (
      <>
        <Typography variant="h6" gutterBottom>
          Add new variable (value)
        </Typography>
        <form onSubmit={handleSubmit(onHandleSubmit)}>
          <TextField 
            name="name" 
            label="Name" 
            required 
            inputRef={register}/>
            <br />
            <br />
          <TextField
            name="description"
            label="Description"
            required
            inputRef={register}
          />
          <br />
          <br />
          Options
          <br />

          <TextField
            name="option"
            label="Option"
            required
            inputRef={register}
          />

          <br />
          <Button variant="outlined" onClick={() => console.log('click')} size="small">Add option</Button>

          <br />
          <br />
          <Button type="submit" variant="contained">Add variable</Button>
        </form>
    </>
  )
}
