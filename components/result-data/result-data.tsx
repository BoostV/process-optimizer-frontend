import { useExperiment } from '../../context/experiment-context'
import { Suggestions } from './suggestions'
import { TitleCard } from '../title-card/title-card'
import { Tooltip, IconButton, Hidden, Box } from '@material-ui/core'
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import { useGlobal } from "../../context/global-context"
import { isUIBig } from '../../utility/ui-util';
import useStyles from './result-data.style';
import { SingleDataPoint } from './single-data-point'
import { NextExperiments } from './next-experiments'

interface ResultDataProps {
  nextValues: string[][]
  headers: string[]
  expectedMinimum?: any[][]
  onMouseEnterExpand: () => void
  onMouseLeaveExpand: () => void
}

export const ResultData = (props: ResultDataProps) => {
  const { nextValues, headers, expectedMinimum, onMouseEnterExpand, onMouseLeaveExpand } = props
  const classes = useStyles()
  const { state: { experiment } } = useExperiment()
  const global = useGlobal()
  const suggestionCount: number = experiment?.extras ? experiment.extras['experimentSuggestionCount'] : 1

  return (
    <TitleCard
      padding={0}
      title={
        <>
          Result data
          <Hidden lgDown>
            <Tooltip title={(isUIBig(global.state, "result-data") ? "Collapse" : "Expand") + " 'Result data' and 'Data points'"}>
              <IconButton
                size="small"
                className={classes.titleButton}
                onClick={() => global.dispatch({ type: 'toggleUISize', payload: "result-data" })}
                onMouseEnter={() => onMouseEnterExpand()}
                onMouseLeave={() => onMouseLeaveExpand()}>
                <ZoomOutMapIcon fontSize="small" className={classes.titleIcon} />
              </IconButton>
            </Tooltip>

          </Hidden>
        </>
      }>
      <Box p={2}>
        <NextExperiments suggestionCount={suggestionCount} />
        <Suggestions values={nextValues} headers={headers} />
      </Box>
      {expectedMinimum?.length > 0 &&
        <Box pt={2} pl={2} pr={2} className={classes.extrasContainer}>
            <SingleDataPoint title="Expected minimum" headers={headers} dataPoint={expectedMinimum} />
        </Box>
      }
    </TitleCard>
  )
}