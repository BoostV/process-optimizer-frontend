import { TextField, Tooltip } from '@mui/material'
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
  const constraints =
    experiment.constraints.find(c => c.type === 'sum')?.dimensions.length ?? 0
  const dataPoints = experiment.dataPoints.filter(
    d => d.meta.enabled && d.meta.valid
  ).length
  const initialPoints = experiment.optimizerConfig.initialPoints
  const isSuggestionCountDisabled =
    dataPoints >= initialPoints && constraints > 1

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
