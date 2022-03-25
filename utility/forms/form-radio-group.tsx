import { RadioGroup, RadioGroupProps, Tooltip, FormControlLabel, Radio } from "@material-ui/core"
import React from "react"
import { Controller } from "react-hook-form"

type FormRadioGroupProps = {
    name: string
    control: any
    values: string[]
    labels: string[]
    ariaLabel: string
    tooltips: string[]
}

export const FormRadioGroup = ({ name, control, values, labels, ariaLabel, tooltips,...rest }: FormRadioGroupProps & RadioGroupProps) => (
    <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => 
          <RadioGroup row aria-label={ariaLabel} value={value} onChange={e => onChange(e.target.value)} {...rest}>
            {values.map((v, i) =>
              <Tooltip key={i} title={tooltips[i]}>
                <FormControlLabel value={values[i]} control={<Radio />} label={labels[i]} />
              </Tooltip>
            )}
          </RadioGroup>
        }
    />
)