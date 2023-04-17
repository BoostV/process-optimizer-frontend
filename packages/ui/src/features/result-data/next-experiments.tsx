import { Divider, Stack, TextField, Tooltip } from '@mui/material'
import { ChangeEvent, FC } from 'react'
import { ExperimentType } from '@boostv/process-optimizer-frontend-core'

type Props = {
  experiment: ExperimentType
  onSuggestionChange: (suggestionCount: string) => void
  onXiChange: (xi: number) => void
}

export const NextExperiments: FC<Props> = ({
  experiment,
  onSuggestionChange,
  onXiChange,
}) => {
  const suggestionCount: number =
    (experiment.extras['experimentSuggestionCount'] as number) ?? 1

  const handleSuggestionChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => onSuggestionChange(e.target.value)

  const handleXiChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => onXiChange(Number(e.target.value))

  return (
    <Stack
      direction="row"
      spacing={2}
      divider={<Divider orientation="vertical" flexItem />}
    >
      <TextField
        fullWidth
        type="number"
        value={suggestionCount}
        name="numberOfSuggestions"
        label="Number of suggested experiments"
        onChange={handleSuggestionChange}
      />
      <Tooltip
        disableInteractive
        enterDelay={1000}
        arrow={true}
        placement="top-start"
        title="Desired improvement in relation to the best result obtained thus far. Use the same scale as your scores and update this value as you gather more data. Large values result in suggestions far away from previously tried settings, small values result in suggestions close to the expected minimum of the model. As an example, if your best result is 100 and you wish to reach 25, this value should be set to 75"
      >
        <TextField
          fullWidth
          type="number"
          value={experiment.optimizerConfig.xi}
          name="Xi"
          label="Desired further improvement"
          onChange={handleXiChange}
        />
      </Tooltip>
    </Stack>
  )
}
