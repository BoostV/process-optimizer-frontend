import { FormControl, Input, InputLabel, Tooltip } from '@material-ui/core'
import { Ref } from 'react';

type InputWithHelpProps = {
  id: string
  label: string
  defaultValue: number | string
  helpText: string
  onChange: () => void
  register: Ref<any>
  disabled?: boolean
}

export default function InputWithHelp(props: InputWithHelpProps) {
  const { id, label, helpText, onChange, register, defaultValue, disabled } = props

  return (
    <FormControl 
      disabled={disabled}
      fullWidth
      margin="dense">
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <Tooltip title={helpText}>
        <Input
          name={id}
          id={id}
          defaultValue={defaultValue}
          inputRef={register}
          onChange={onChange}
        />
      </Tooltip>
    </FormControl>
  )
}
