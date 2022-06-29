import { useExperiment } from '../../context/experiment-context'
import { Suggestions } from './suggestions'
import { TitleCard } from '../title-card/title-card'
import { Tooltip, IconButton, Hidden, Box } from '@mui/material'
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap'
import { useGlobal } from '../../context/global-context'
import { isUIBig } from '../../utility/ui-util'
import useStyles from './result-data.style'
import { SingleDataPoint } from './single-data-point'
import { NextExperiments } from './next-experiments'
import { InitializationProgress } from './initialization-progress'

interface ResultDataProps {
  nextValues: string[][]
  headers: string[]
  expectedMinimum?: any[][]
  onMouseEnterExpand?: () => void
  onMouseLeaveExpand?: () => void
}

export const ResultData = (props: ResultDataProps) => {
  const {
    nextValues,
    headers,
    expectedMinimum,
    onMouseEnterExpand,
    onMouseLeaveExpand,
  } = props
  const classes = useStyles()
  const {
    state: { experiment },
  } = useExperiment()
  const global = useGlobal()
  const suggestionCount: number =
    (experiment.extras['experimentSuggestionCount'] as number) ?? 1

  const isInitializing =
    experiment.dataPoints.length < experiment.optimizerConfig.initialPoints
  const summary = isInitializing ? (
    <InitializationProgress />
  ) : expectedMinimum && expectedMinimum.length > 0 ? (
    <Box pt={2} pl={2} pr={2} className={classes.extrasContainer}>
      <SingleDataPoint
        title="Expected minimum"
        headers={headers}
        dataPoint={expectedMinimum ?? []}
      />
    </Box>
  ) : (
    <div>Please run experiment</div>
  )
  return (
    <TitleCard
      padding={0}
      title={
        <>
          Result data
          <Hidden xlDown>
            <Tooltip
              title={
                (isUIBig(global.state, 'result-data') ? 'Collapse' : 'Expand') +
                " 'Result data' and 'Data points'"
              }
            >
              <IconButton
                size="small"
                className={classes.titleButton}
                onClick={() =>
                  global.dispatch({
                    type: 'toggleUISize',
                    payload: 'result-data',
                  })
                }
                onMouseEnter={() => onMouseEnterExpand?.()}
                onMouseLeave={() => onMouseLeaveExpand?.()}
              >
                <ZoomOutMapIcon
                  fontSize="small"
                  className={classes.titleIcon}
                />
              </IconButton>
            </Tooltip>
          </Hidden>
        </>
      }
    >
      <Box p={2}>
        {!isInitializing && (
          <NextExperiments suggestionCount={suggestionCount} />
        )}
        <Suggestions values={nextValues} headers={headers} />
      </Box>
      {summary}
    </TitleCard>
  )
}
