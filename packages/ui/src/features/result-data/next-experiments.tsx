import { TextField, Tooltip } from '@mui/material'
import { ChangeEvent, FC } from 'react'
import {
  ExperimentType,
  selectActiveDataPoints,
  selectSumConstraint,
  useSelector,
} from '@boostv/process-optimizer-frontend-core'

type Props = {
  experiment: ExperimentType
  onSuggestionChange: (suggestionCount: string) => void
}

export const NextExperiments: FC<Props> = ({
  experiment,
  onSuggestionChange,
}) => {
  const sumConstraint = useSelector(selectSumConstraint)
  const constraints = sumConstraint?.dimensions.length ?? 0
  const dataPoints = useSelector(selectActiveDataPoints)
  const initialPoints = experiment.optimizerConfig.initialPoints
  const isSuggestionCountDisabled =
    dataPoints.length >= initialPoints && constraints > 1

  const suggestionCount: number =
    (experiment.extras['experimentSuggestionCount'] as number) ?? 1

  const handleSuggestionChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => onSuggestionChange(e.target.value)

  return (
    <Tooltip
      title={
        isSuggestionCountDisabled
          ? 'Number of suggested experiments cannot be edited while there is a sum constraint.'
          : ''
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
        disabled={isSuggestionCountDisabled}
      />
    </Tooltip>
  )
}
