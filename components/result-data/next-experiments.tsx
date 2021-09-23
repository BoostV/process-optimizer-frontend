import { TextField } from "@material-ui/core";
import { useExperiment } from "../../context/experiment-context";

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
        label="Number of suggestions"
        onChange={(e) => dispatch({ type: 'updateSuggestionCount', payload: e.target.value })}
      />
    </>
  )
}