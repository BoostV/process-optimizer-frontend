import { Box, Container, Divider, Stack, TextField } from '@mui/material'
import { useExperiment } from '../../context/experiment-context'

export const NextExperiments = () => {
  const {
    state: { experiment },
    dispatch,
  } = useExperiment()
  const suggestionCount: number =
    (experiment.extras['experimentSuggestionCount'] as number) ?? 1

  return (
    <Stack
      direction="row"
      spacing={2}
      divider={<Divider orientation="vertical" flexItem />}
    >
      <TextField
        fullWidth
        type="number"
        defaultValue={suggestionCount}
        name="numberOfSuggestions"
        label="Number of suggested experiments"
        onChange={e =>
          dispatch({ type: 'updateSuggestionCount', payload: e.target.value })
        }
      />
      <TextField
        fullWidth
        type="number"
        defaultValue={experiment.optimizerConfig.xi}
        name="Xi"
        label="Xi"
        onChange={e =>
          dispatch({
            type: 'updateConfiguration',
            payload: {
              ...experiment.optimizerConfig,
              xi: Number(e.target.value),
            },
          })
        }
      />
    </Stack>
  )
}
