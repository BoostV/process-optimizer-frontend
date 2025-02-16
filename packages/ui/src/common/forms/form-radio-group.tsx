import {
  RadioGroup,
  RadioGroupProps,
  Tooltip,
  FormControlLabel,
  Radio,
} from '@mui/material'
import { Controller } from 'react-hook-form'

type FormRadioGroupProps = {
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any
  values: string[]
  labels: string[]
  ariaLabel: string
  tooltips: string[]
}

export const FormRadioGroup = ({
  name,
  control,
  values,
  labels,
  ariaLabel,
  tooltips,
  ...rest
}: FormRadioGroupProps & RadioGroupProps) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { onChange, value } }) => (
      <RadioGroup
        row
        aria-label={ariaLabel}
        value={value}
        onChange={e => onChange(e.target.value)}
        {...rest}
      >
        {values.map((_v, i) => (
          <Tooltip disableInteractive key={i} title={tooltips[i] ?? ''}>
            <FormControlLabel
              value={values[i]}
              control={<Radio />}
              label={labels[i]}
            />
          </Tooltip>
        ))}
      </RadioGroup>
    )}
  />
)
