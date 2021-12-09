import { RadioGroup, RadioGroupProps, Tooltip, FormControlLabel, Radio } from "@material-ui/core"
import React from "react"
import { Controller } from "react-hook-form"

type FormRadioGroupProps = {
    name: string
    control: any
    tooltips: string[]
}

export const FormRadioGroup = ({ name, control, tooltips,...rest }: FormRadioGroupProps & RadioGroupProps) => (
    <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => 
          <RadioGroup row aria-label="value-type" value={value} onChange={e => onChange(e.target.value)} {...rest}>
            <Tooltip title={tooltips[0]}>
              <FormControlLabel value="continuous" control={<Radio />} label="Continuous" />
            </Tooltip>
            <Tooltip title={tooltips[1]}>
              <FormControlLabel value="discrete" control={<Radio />} label="Discrete" />
            </Tooltip>
          </RadioGroup>
        }
    />
)