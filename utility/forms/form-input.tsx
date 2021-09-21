import { TextField } from "@material-ui/core"
import React from "react"
import { Controller } from "react-hook-form"

const FormInputText = ({ name, control, defaultValue = undefined, rules = {}, transform = (x:any) => x, ...rest }) => (
    <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        rules={rules}
        render={({ field: { ref, onChange } }) => <TextField
            {...rest}
            defaultValue={defaultValue}
            inputRef={ref}
            onChange={e => onChange(transform(e.target.value))}
        />}
    />
)

export default FormInputText