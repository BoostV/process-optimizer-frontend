import { useSelector, useExperiment } from '@/context/experiment'
import { TitleCard } from '@process-optimizer-frontend/core/src/features/core/title-card/title-card'
import { Suggestions } from '@process-optimizer-frontend/core/src/features/result-data/suggestions'
import { SingleDataPoint } from '@process-optimizer-frontend/core/src/features/result-data/single-data-point'
import { Tooltip, IconButton, Hidden, Box } from '@mui/material'
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap'
import { useGlobal } from '@/context/global'
import { isUIBig } from '@/utility/ui-util'
import useStyles from './experimentation-guide.style'
import { NextExperiments } from '@process-optimizer-frontend/core/src/features/result-data/next-experiments'
import { InitializationProgress } from '@process-optimizer-frontend/core/src/features/result-data/initialization-progress'
import { selectIsInitializing } from '@/context/experiment'

interface ResultDataProps {
  nextValues: string[][]
  headers: string[]
  expectedMinimum?: any[][]
  onMouseEnterExpand?: () => void
  onMouseLeaveExpand?: () => void
}

export const ExperimentationGuide = (props: ResultDataProps) => {
  const {
    nextValues,
    headers,
    expectedMinimum,
    onMouseEnterExpand,
    onMouseLeaveExpand,
  } = props
  const { classes } = useStyles()
  const {
    state: { uiSizes },
    dispatch,
  } = useGlobal()
  const {
    state: { experiment },
    dispatch: dispatchExperiment,
  } = useExperiment()

  const isInitializing = useSelector(selectIsInitializing)
  const summary = isInitializing ? (
    <InitializationProgress
      experiment={experiment}
      onInitialPointsChange={initialPoints =>
        dispatchExperiment({
          type: 'updateConfiguration',
          payload: { ...experiment.optimizerConfig, initialPoints },
        })
      }
    />
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
          Experimentation guide
          <Hidden xlDown>
            <Tooltip
              title={
                (isUIBig(uiSizes, 'result-data') ? 'Collapse' : 'Expand') +
                " 'Result data' and 'Data points'"
              }
            >
              <IconButton
                size="small"
                className={classes.titleButton}
                onClick={() =>
                  dispatch({
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
          <NextExperiments
            experiment={experiment}
            onSuggestionChange={suggestionCount =>
              dispatchExperiment({
                type: 'updateSuggestionCount',
                payload: suggestionCount,
              })
            }
            onXiChange={xi =>
              dispatchExperiment({
                type: 'updateConfiguration',
                payload: {
                  ...experiment.optimizerConfig,
                  xi,
                },
              })
            }
          />
        )}
        {!nextValues ||
          (nextValues.length === 0 && (
            <div>Please run experiment to calculate suggestions</div>
          ))}
        <Suggestions values={nextValues} headers={headers} />
      </Box>
      {summary}
    </TitleCard>
  )
}
