import { Divider, Stack, TextField } from '@mui/material'
import { ChangeEvent } from 'react'
import { useExperiment } from '@/context/experiment'

export const NextExperiments = () => {
  const {
    state: { experiment },
    dispatch,
  } = useExperiment()
  const suggestionCount: number =
    (experiment.extras['experimentSuggestionCount'] as number) ?? 1

  const handleSuggestionChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    dispatch({ type: 'updateSuggestionCount', payload: e.target.value })
  }

  const handleXiChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    dispatch({
      type: 'updateConfiguration',
      payload: {
        ...experiment.optimizerConfig,
        xi: Number(e.target.value),
      },
    })
  }

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
      <TextField
        fullWidth
        type="number"
        value={experiment.optimizerConfig.xi}
        name="Xi"
        label="Xi"
        onChange={handleXiChange}
      />
    </Stack>
  )
}
