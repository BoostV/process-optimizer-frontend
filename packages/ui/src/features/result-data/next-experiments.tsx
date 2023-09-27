import { TextField, Tooltip } from '@mui/material'
import { ChangeEvent, FC } from 'react'
import {
  selectIsSuggestionCountEditable,
  selectCalculatedSuggestionCount,
  useSelector,
} from '@boostv/process-optimizer-frontend-core'

type Props = {
  onSuggestionChange: (suggestionCount: string) => void
}

export const NextExperiments: FC<Props> = ({ onSuggestionChange }) => {
  const isSuggestionCountEditable = useSelector(selectIsSuggestionCountEditable)
  const suggestionCount = useSelector(selectCalculatedSuggestionCount)

  const handleSuggestionChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => onSuggestionChange(e.target.value)

  return (
    <Tooltip
      title={
        isSuggestionCountEditable
          ? ''
          : 'Number of suggested experiments cannot be edited while there is a sum constraint.'
      }
      disableInteractive
    >
      <TextField
        type="number"
        value={suggestionCount}
        name="numberOfSuggestions"
        label="Suggestions"
        size="small"
        onChange={handleSuggestionChange}
        disabled={!isSuggestionCountEditable}
      />
    </Tooltip>
  )
}
