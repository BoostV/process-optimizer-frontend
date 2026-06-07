import { TextField } from '@mui/material'
import { ChangeEvent, FC, useEffect, useState } from 'react'
import {
  selectCalculatedSuggestionCount,
  useSelector,
} from '@boostv/process-optimizer-frontend-core'

type Props = {
  maxSuggestionCount?: number
  onSuggestionChange: (suggestionCount: string) => void
}

export const NextExperiments: FC<Props> = ({
  onSuggestionChange,
  maxSuggestionCount,
}) => {
  const suggestionCount = useSelector(selectCalculatedSuggestionCount)
  const [suggestionCountUI, setSuggestionCountUI] = useState(suggestionCount)
  // Keep the input in sync with the calculated count when it changes underneath
  // us — e.g. once the model is first fit the count drops from the
  // initialization deficit to the user's chosen count, and the field must
  // reflect that rather than keep showing the init value.
  useEffect(() => {
    setSuggestionCountUI(suggestionCount)
  }, [suggestionCount])

  const handleSuggestionChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => onSuggestionChange(e.target.value)

  return (
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
    />
  )
}
