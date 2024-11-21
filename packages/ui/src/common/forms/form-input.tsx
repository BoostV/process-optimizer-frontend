import { TextField, TextFieldProps } from '@mui/material'
import { Controller } from 'react-hook-form'

type FormInputTextPropType = {
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any
  rules?: Parameters<typeof Controller>[0]['rules']
  transform?: (x: unknown) => unknown
}

const FormInputText = ({
  name,
  control,
  rules,
  transform = (x: unknown) => x,
  ...rest
}: FormInputTextPropType & TextFieldProps) => (
  <Controller
    name={name}
    control={control}
    rules={rules}
    render={({ field: { ref, onChange, value }, fieldState: { error } }) => (
      <TextField
        {...rest}
        value={value}
        inputRef={ref}
        onChange={e => onChange(transform(e.target.value))}
        error={!!error}
        helperText={error ? error.message : null}
      />
    )}
  />
)

export default FormInputText
