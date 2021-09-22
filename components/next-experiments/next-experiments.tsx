import { useExperiment } from '../../context/experiment-context'
import { Suggestions } from './suggestions'
import { TitleCard } from '../title-card/title-card'
import { TextField, Tooltip, IconButton, Hidden, Table, TableHead, TableRow, TableBody, TableCell } from '@material-ui/core'
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import { useGlobal } from "../../context/global-context"
import useStyles from './next-experiments.style';
import { isUIBig } from '../../utility/ui-util';

interface SingleDataPointProps {
  headers: string[]
  dataPoint: any[][]
}

const SingleDataPoint = ({headers, dataPoint}: SingleDataPointProps) => (
  <Table>
    <TableHead>
      <TableRow>
        {headers.concat(["Score"]).map((h, idx) => <TableCell key={idx}>{h}</TableCell>)}
      </TableRow>
    </TableHead>
    <TableBody>
      <TableRow>
        {dataPoint.flat().map((dp, idx) => <TableCell key={idx}>{dp}</TableCell> )}
      </TableRow>
    </TableBody>
  </Table>
)

interface NextExperimentProps {
  nextValues: string[][]
  headers: string[]
  expectedMinimum?: any[][]
  onMouseEnterExpand: () => void
  onMouseLeaveExpand: () => void
}

export const NextExperiments = (props: NextExperimentProps) => {
  const { nextValues, headers, expectedMinimum, onMouseEnterExpand, onMouseLeaveExpand } = props
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
      {expectedMinimum && <SingleDataPoint headers={headers} dataPoint={expectedMinimum} />}
      <TextField
        fullWidth
        type="number"
        margin="dense"
        defaultValue={suggestionCount}
        name="numberOfSuggestions"
        label="Number of suggestions"
        onChange={(e) => dispatch({ type: 'updateSuggestionCount', payload: e.target.value })}
      />
      <Suggestions values={nextValues} headers={headers} />
    </TitleCard>
  )
}