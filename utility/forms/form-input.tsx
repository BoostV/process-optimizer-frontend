import { TextField, TextFieldProps } from "@material-ui/core"
import React from "react"
import { Controller } from "react-hook-form"

type FormInputTextPropType = {
    name: string
    control: any
    rules?: any
    transform?: (x:any) => any
}

const FormInputText = ({ name, control, rules, transform = (x:any) => x, ...rest }: FormInputTextPropType & TextFieldProps) => (
    <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { ref, onChange } }) => <TextField
            {...rest}
            inputRef={ref}
            onChange={e => onChange(transform(e.target.value))}
        />}
    />
)

export default FormInputText