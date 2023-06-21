import { TextField } from '@mui/material'
import { ChangeEvent, FC } from 'react'
import { ExperimentType } from '@boostv/process-optimizer-frontend-core'

type Props = {
  experiment: ExperimentType
  onSuggestionChange: (suggestionCount: string) => void
}

export const NextExperiments: FC<Props> = ({
  experiment,
  onSuggestionChange,
}) => {
  const suggestionCount: number =
    (experiment.extras['experimentSuggestionCount'] as number) ?? 1

  const handleSuggestionChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => onSuggestionChange(e.target.value)

  return (
    <TextField
      type="number"
      value={suggestionCount}
      name="numberOfSuggestions"
      label="Number of suggestions"
      onChange={handleSuggestionChange}
    />
  )
}
