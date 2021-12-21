import { Grid, TextField, Tooltip } from "@material-ui/core";
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

type InputWithHelpProps = {
  helpText: string
  name: string
  disabled?: boolean
  defaultValue: string | number
  label: string
  onChange: (value: string) => void
}

export const InputWithHelp = ({ helpText, name, disabled = false, defaultValue, label, onChange }: InputWithHelpProps) => {
  return (
    <Grid container spacing={1} alignItems="flex-end">
      <Grid item>
        <Tooltip title={helpText}>
          <InfoOutlinedIcon fontSize="small" />
        </Tooltip>
      </Grid>
      <Grid item>
        <TextField
          name={name}
          disabled={disabled}
          fullWidth
          margin="dense"
          defaultValue={defaultValue}
          label={label}
          onChange={(e) => onChange(e.target.value)}
        />
      </Grid>
    </Grid>
  )
}
