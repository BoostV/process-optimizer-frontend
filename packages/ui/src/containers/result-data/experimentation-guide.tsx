import {
  useSelector,
  useExperiment,
  selectExpectedMinimum,
  selectVariableNames,
  selectNextExperimentValues,
  selectIsInitializing,
} from '@boostv/process-optimizer-frontend-core'
import {
  Tooltip,
  IconButton,
  Hidden,
  Box,
  Stack,
  Skeleton,
} from '@mui/material'
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
import { ReactNode } from 'react'

interface ResultDataProps {
  id?: string
  isUIBig?: boolean
  loading?: boolean
  loadingView?: ReactNode
  loadingMode?: 'skeleton' | 'overlay' | 'custom'
  showSettingsWhileLoading?: boolean
  warning?: string
  padding?: number
  toggleUISize?: () => void
  onMouseEnterExpand?: () => void
  onMouseLeaveExpand?: () => void
}

export const ExperimentationGuide = (props: ResultDataProps) => {
  const {
    id = 'experimentation-guide',
    isUIBig = false,
    loading,
    loadingView,
    warning,
    padding,
    loadingMode,
    showSettingsWhileLoading,
    toggleUISize,
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

  const defaultLoadingView = (
    <Stack direction="column" spacing={2} m={2}>
      <Skeleton variant="rectangular" width="100%" height={200} />
      <Skeleton variant="rectangular" width="100%" height={100} />
    </Stack>
  )

  const settings = (
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
  )

  const guideLoadingMode = loadingMode === 'overlay' ? 'overlay' : 'custom'

  const guideLoadingView =
    loadingMode === 'overlay'
      ? undefined
      : loadingMode === 'custom'
      ? loadingView
      : defaultLoadingView

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
      id={id}
      loading={loading}
      loadingView={
        <>
          {showSettingsWhileLoading && !isInitializing ? (
            <Box pl={2} pr={2} pt={2}>
              {settings}
            </Box>
          ) : (
            <></>
          )}
          {guideLoadingView}
        </>
      }
      loadingMode={guideLoadingMode}
      warning={warning}
      padding={padding ?? 0}
      title={
        <>
          Experimentation guide
          {toggleUISize !== undefined && (
            <Hidden xlDown>
              <Tooltip
                disableInteractive
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
          )}
        </>
      }
    >
      <Box p={2}>
        {!isInitializing && settings}
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
