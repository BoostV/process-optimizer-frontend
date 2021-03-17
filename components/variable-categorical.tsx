import { TextField, Typography } from '@material-ui/core'
import { useForm } from "react-hook-form";

type Inputs = {
  name: string,
  description: string,
  minVal: string,
  maxVal: string,
  order: string,
};

export default function VariableCategorical() {
  const { register, handleSubmit, watch, errors } = useForm<Inputs>();
  const onHandleSubmit = async (data: Inputs) => console.log(data)

  return (
      <>
          <Typography variant="h5" gutterBottom>
            Add new variable 
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
            <input type="submit" />
          </form>
      </>
  )
}
