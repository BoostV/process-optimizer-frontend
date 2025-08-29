import { TextField, Tooltip } from '@mui/material'
import { ChangeEvent, FC, useState } from 'react'
import {
  selectIsSuggestionCountEditable,
  selectCalculatedSuggestionCount,
  useSelector,
  selectMaxEnabledVariablesBeforeSuggestionLimitation,
} from '@boostv/process-optimizer-frontend-core'

type Props = {
  maxSuggestionCount?: number
  onSuggestionChange: (suggestionCount: string) => void
}

export const NextExperiments: FC<Props> = ({
  onSuggestionChange,
  maxSuggestionCount,
}) => {
  const isSuggestionCountEditable = useSelector(state =>
    selectIsSuggestionCountEditable(state)
  )
  const suggestionCount = useSelector(state =>
    selectCalculatedSuggestionCount(state)
  )
  const maxEnabledVariablesBeforeSuggestionLimitation = useSelector(
    selectMaxEnabledVariablesBeforeSuggestionLimitation
  )
  const [suggestionCountUI, setSuggestionCountUI] = useState(suggestionCount)

  const tooltipMsg = isSuggestionCountEditable
    ? ''
    : `Number of suggested experiments cannot be edited while there is a sum constraint or number of enabled factors is greater than ${maxEnabledVariablesBeforeSuggestionLimitation}.`

  const handleSuggestionChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => onSuggestionChange(e.target.value)

  return (
    <Tooltip title={tooltipMsg} disableInteractive>
      <TextField
        type="number"
        value={suggestionCountUI + ''}
        name="numberOfSuggestions"
        label={`Suggestions${
          maxSuggestionCount !== undefined ? ` (1-${maxSuggestionCount})` : ''
        }`}
        size="small"
        onChange={val => {
          setSuggestionCountUI(Number(val.target.value))
          handleSuggestionChange(val)
        }}
        disabled={!isSuggestionCountEditable}
      />
    </Tooltip>
  )
}
