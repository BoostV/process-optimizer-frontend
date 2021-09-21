import { TextField } from "@material-ui/core"
import React from "react"
import { Controller } from "react-hook-form"

const FormInputText = ({ name, control, defaultValue, ...rest}) => (
    <Controller name={name} control={control} defaultValue={defaultValue}
    render={({field: {ref, onChange}}) => <TextField
          {...rest}
          defaultValue={defaultValue}
          inputRef={ref}
          onChange={onChange}
        />}
    />
  )

export default FormInputText