import { TextField, Tooltip, IconButton, Hidden } from '@material-ui/core'
import { useExperiment } from '../context/experiment-context'
import { Suggestions } from './suggestions'
import { TitleCard } from './title-card'
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import { useGlobal } from "../context/global-context"
import useStyles from '../styles/next-experiments.style';
import { isUIBig } from '../utility/ui-util';

interface NextExperimentProps {
  nextValues: string[][]
  headers: string[]
  onMouseEnterExpand: () => void
  onMouseLeaveExpand: () => void
}

export const NextExperiments = (props: NextExperimentProps) => {
  const { nextValues, headers, onMouseEnterExpand, onMouseLeaveExpand } = props
  const classes = useStyles()
  const { state: { experiment }, dispatch } = useExperiment()
  const global = useGlobal()
  const suggestionCount: number = experiment?.extras ? experiment.extras['experimentSuggestionCount'] : 1

  return (
    <TitleCard
      title={
        <>
          {'Next experiment' + (suggestionCount > 1 ? 's' : '')}
          <Hidden lgDown>
            <Tooltip title={(isUIBig(global.state, "next-experiments") ? "Collapse" : "Expand") + " 'Next experiment' and 'Data points'"}>
              <IconButton 
                size="small"
                className={classes.titleButton}
                onClick={() => global.dispatch({ type: 'toggleUISize', payload: "next-experiments" })}
                onMouseEnter={() => onMouseEnterExpand()}
                onMouseLeave={() => onMouseLeaveExpand()}>
                <ZoomOutMapIcon fontSize="small" className={classes.titleIcon} />
              </IconButton>
            </Tooltip>

          </Hidden>
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