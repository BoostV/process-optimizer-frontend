import {
  useSelector,
  useExperiment,
  selectExpectedMinimum,
  selectVariableNames,
  selectNextExperimentValues,
  selectIsInitializing,
} from '@boostv/process-optimizer-frontend-core'
import { Tooltip, IconButton, Hidden, Box } from '@mui/material'
import { ZoomOutMap } from '@mui/icons-material'
import useStyles from './experimentation-guide.style'
import {
  InitializationProgress,
  NextExperiments,
  SingleDataPoint,
  Suggestions,
  TitleCard,
} from '@ui/features'
import { CopySuggested } from '@ui/features/result-data/copy-suggested'

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
    <Box p={2}>Please run experiment</Box>
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
                <ZoomOutMap fontSize="small" className={classes.titleIcon} />
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
            <Box p={2}>Please run experiment to calculate suggestions</Box>
          ))}
        <Suggestions
          values={nextValues}
          headers={headers}
          onCopyToDataPoints={index =>
            dispatchExperiment({
              type: 'copySuggestedToDataPoints',
              payload: [index],
            })
          }
        />
      </Box>
      {nextValues.length > 0 &&
        nextValues[0] !== undefined &&
        nextValues[0].length > 0 && (
          <CopySuggested
            onClick={() =>
              dispatchExperiment({
                type: 'copySuggestedToDataPoints',
                payload: [...Array(nextValues.length)].map((_, i) => i),
              })
            }
          />
        )}
      {summary}
    </TitleCard>
  )
}
