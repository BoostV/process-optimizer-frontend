import { Card, CardContent, TextField, Typography } from '@material-ui/core'
import { useExperiment } from '../context/experiment-context'
import { Suggestions } from './suggestions'

interface NextExperimentProps {
  nextValues: string[][]
  headers: string[]
}

export const NextExperiments = (props: NextExperimentProps) => {
  const { nextValues, headers } = props
  const { state: { experiment }, dispatch } = useExperiment()
  const suggestionCount: number = experiment?.extras ? experiment.extras['experimentSuggestionCount'] : 1

  return (
    <Card>
      <CardContent>
          <Typography variant="h6">
            {'Next experiment' + (suggestionCount > 1 ? 's' : '')}
          </Typography>
          <TextField
            fullWidth
            type="number"
            margin="dense"
            defaultValue={suggestionCount}
            name="numberOfSuggestions"
            label="Number of suggestions"
            onChange={(e) => dispatch({ type: 'updateSuggestionCount', payload: e.target.value }) }
            />
          <Suggestions values={nextValues} headers={headers} />          
      </CardContent>
    </Card>
  )
}