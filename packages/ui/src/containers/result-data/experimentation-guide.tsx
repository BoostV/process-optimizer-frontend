import {
  useSelector,
  useExperiment,
  selectExpectedMinimum,
  selectVariableNames,
  selectNextExperimentValues,
} from '@process-optimizer-frontend/core'
import { Tooltip, IconButton, Hidden, Box } from '@mui/material'
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap'
import useStyles from './experimentation-guide.style'
import { selectIsInitializing } from '@process-optimizer-frontend/core'
import {
  InitializationProgress,
  NextExperiments,
  SingleDataPoint,
  Suggestions,
  TitleCard,
} from '@ui/features'

interface ResultDataProps {
  isUIBig?: boolean
  toggleUISize?: () => void
  onMouseEnterExpand?: () => void
  onMouseLeaveExpand?: () => void
}

export const ExperimentationGuide = (props: ResultDataProps) => {
  const {
    isUIBig = false,
    toggleUISize = () => {},
    onMouseEnterExpand,
    onMouseLeaveExpand,
  } = props
  const { classes } = useStyles()
  const {
    state: { experiment },
    dispatch: dispatchExperiment,
  } = useExperiment()

  const nextValues = useSelector(selectNextExperimentValues)
  const headers = useSelector(selectVariableNames)
  const expectedMinimum = useSelector(selectExpectedMinimum)
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
                (isUIBig ? 'Collapse' : 'Expand') +
                " 'Result data' and 'Data points'"
              }
            >
              <IconButton
                size="small"
                className={classes.titleButton}
                onClick={toggleUISize}
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
