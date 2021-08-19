import { TextField, Tooltip, IconButton } from '@material-ui/core'
import { useExperiment } from '../context/experiment-context'
import { Suggestions } from './suggestions'
import { TitleCard } from './title-card'
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import { useGlobal } from "../context/global-context"

interface NextExperimentProps {
  nextValues: string[][]
  headers: string[]
}

export const NextExperiments = (props: NextExperimentProps) => {
  const { nextValues, headers } = props
  const { state: { experiment }, dispatch } = useExperiment()
  const global = useGlobal()
  const suggestionCount: number = experiment?.extras ? experiment.extras['experimentSuggestionCount'] : 1

  return (
    <TitleCard
      title={
        <>
          {'Next experiment' + (suggestionCount > 1 ? 's' : '')}
          <Tooltip title="Expand next experiments and data points cards">
            <IconButton 
              size="small"
              onClick={() => global.dispatch({ type: 'toggleUISize', payload: 'next-experiments' })}>
              <ZoomOutMapIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      }>
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
    </TitleCard>
  )
}