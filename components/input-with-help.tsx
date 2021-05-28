import { FormControl, IconButton, Input, InputAdornment, InputLabel } from '@material-ui/core'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { MouseEvent, Ref } from 'react';

type InputWithHelpProps = {
  id: string
  label: string
  defaultValue: number | string
  helpText: string
  onHelpClick: (e: MouseEvent<HTMLElement>, helpText: string) => void
  onChange: () => void
  register: Ref<any>
  disabled?: boolean
}

export default function InputWithHelp(props: InputWithHelpProps) {
  const { id, label, helpText, onHelpClick, onChange, register, defaultValue, disabled } = props

  return (
    <FormControl 
      disabled={disabled}
      fullWidth
      margin="dense">
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <Input
        name={id}
        id={id}
        defaultValue={defaultValue}
        inputRef={register}
        onChange={onChange}
        startAdornment={
        <InputAdornment position="start">
          <IconButton
            color="primary"
            size="small"
            aria-label={helpText}
            onClick={(e: MouseEvent<HTMLElement>) => onHelpClick(e, helpText)}>
              <HelpOutlineIcon fontSize="small"/>
          </IconButton>
        </InputAdornment>}
      />
    </FormControl>
  )
}
