import { TextField } from '@mui/material'
import { useExperiment } from '../../context/experiment-context'

interface NextExperimentsProps {
  suggestionCount: number
}

export const NextExperiments = ({ suggestionCount }: NextExperimentsProps) => {
  const { dispatch } = useExperiment()

  return (
    <>
      <TextField
        fullWidth
        type="number"
        margin="dense"
        defaultValue={suggestionCount}
        name="numberOfSuggestions"
        label="Number of suggested experiments"
        onChange={e =>
          dispatch({ type: 'updateSuggestionCount', payload: e.target.value })
        }
      />
    </>
  )
}
