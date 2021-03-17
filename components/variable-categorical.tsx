import { Button, TextField, Typography } from '@material-ui/core'
import { useForm } from "react-hook-form";

type Inputs = {
  name: string,
  description: string,
  minVal: string,
  maxVal: string,
  order: string,
};

type VariableCategoricalProps = {
  onAdded: (data: Inputs) => void,
}

export default function VariableCategorical(props: VariableCategoricalProps) {
  const { register, handleSubmit, watch, errors } = useForm<Inputs>();
  const onHandleSubmit = async (data: Inputs) => props.onAdded(data)

  return (
      <>
          <Typography variant="h6" gutterBottom>
            Add new variable (categorical)
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
            <TextField
              name="minVal"
              label="minVal"
              required
              inputRef={register}
            />
            <br />
            <br />
            <TextField
              name="maxVal"
              label="maxVal"
              required
              inputRef={register}
            />
            <br />
            <br />
            <TextField
              name="order"
              label="Order"
              required
              inputRef={register}
            />
            <br />
            <br />
            <Button type="submit" variant="contained">Add variable</Button>
          </form>
      </>
  )
}
