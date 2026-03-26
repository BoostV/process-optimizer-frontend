import {
  useSelector,
  useExperiment,
  selectNextExperimentValues,
  selectIsInitializing,
  selectActiveVariableNames,
  selectDataPoints,
  selectIsMultiObjective,
  selectActiveScoreVariableLabels,
  selectActiveVariablesFromExperiment,
  selectExpectedMinimum,
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
import { experimentResultSchema } from '@boostv/process-optimizer-frontend-core'
import { OneDData } from '@boostv/process-optimizer-frontend-plots'
import { z } from 'zod'
import { isArray } from 'remeda'
import _ from 'lodash'
import { groupSinglePlots } from './experimentation-guide.utils'

interface ResultDataProps {
  id?: string
  isUIBig?: boolean
  loading?: boolean
  loadingView?: ReactNode
  loadingMode?: 'skeleton' | 'overlay' | 'custom'
  warning?: string
  padding?: number
  allowIndividualSuggestionCopy?: boolean
  maxSuggestionCount?: number
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
    allowIndividualSuggestionCopy = true,
    maxSuggestionCount,
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
  const variableHeaders = useSelector(selectActiveVariableNames)
  const scoreHeaders = useSelector(selectActiveScoreVariableLabels)
  const expectedMinimum = useSelector(selectExpectedMinimum)
  const isInitializing = useSelector(selectIsInitializing)
  const dataPoints = useSelector(selectDataPoints)
  const isMultiObjective = useSelector(selectIsMultiObjective)
  const activeVariables = selectActiveVariablesFromExperiment(experiment)

  const mapOptionsLabels = (
    plots: (string | OneDData)[]
  ): (string | OneDData)[] =>
    plots.map((plot, i) => {
      if (typeof plot === 'string') return plot
      if (plot.type !== 'options') {
        return plot
      }
      const options = activeVariables[i]?.options
      if (!options) {
        return plot
      }
      return {
        ...plot,
        points: plot.points.map(p => ({
          ...p,
          x: typeof p.x === 'number' ? (options[p.x] ?? p.x) : p.x,
        })),
      }
    })

  const rawOneDGroups = groupSinglePlots(
    experiment.results.plots,
    activeVariables
  )
  const oneDPlots: (string | OneDData)[][] = isMultiObjective
    ? rawOneDGroups.map(mapOptionsLabels)
    : [mapOptionsLabels(rawOneDGroups[0] ?? [])]

  const defaultLoadingView = (
    <Stack direction="column" spacing={2} m={2}>
      <Skeleton variant="rectangular" width="100%" height={200} />
      <Skeleton variant="rectangular" width="100%" height={100} />
    </Stack>
  )

  const guideLoadingMode = loadingMode === 'overlay' ? 'overlay' : 'custom'

  const guideLoadingView =
    loadingMode === 'overlay'
      ? undefined
      : loadingMode === 'custom'
        ? loadingView
        : defaultLoadingView

  const hasPlots = oneDPlots.length > 0
  const hasExpectedMinimum = !!(expectedMinimum && expectedMinimum.length > 0)

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
  ) : hasExpectedMinimum || hasPlots ? (
    <Box pt={2} pl={2} pr={2} className={classes.extrasContainer}>
      <SingleDataPoint
        title={isMultiObjective ? undefined : 'Predicted best solution'}
        variableHeaders={variableHeaders}
        rows={oneDPlots.map((plot, index) => ({
          scoreHeader: `${scoreHeaders[index] ?? ''} (95% credible interval)`,
          dataPoint: hasExpectedMinimum
            ? convertExpectedMinimumToDisplayValue(expectedMinimum!)
            : [],
          plotData: plot,
        }))}
      />
    </Box>
  ) : loading ? (
    <></>
  ) : (
    <Box p={2}>Please run optimizer</Box>
  )

  const debouncedUpdate = _.debounce(suggestionCount => {
    dispatchExperiment({
      type: 'updateSuggestionCount',
      payload: { suggestionCount, maxSuggestionCount },
    })
  }, 1000)

  return (
    <TitleCard
      id={id}
      loading={loading}
      loadingView={guideLoadingView}
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
        {!nextValues ||
          (nextValues.length === 0 && (
            <Box p={2}>Please run optimizer to calculate suggestions</Box>
          ))}
        <Suggestions
          values={nextValues}
          headers={variableHeaders}
          allowIndividualSuggestionCopy={allowIndividualSuggestionCopy}
          onCopyToDataPoints={index =>
            dispatchExperiment({
              type: 'copySuggestedToDataPoints',
              payload: [index],
            })
          }
        />
      </Box>

      <Box
        p={2}
        pt={1}
        display="flex"
        justifyContent={isInitializing ? 'right' : 'space-between'}
      >
        {!isInitializing && (
          <Box width={160}>
            <NextExperiments
              maxSuggestionCount={maxSuggestionCount}
              onSuggestionChange={suggestionCount =>
                debouncedUpdate(suggestionCount)
              }
            />
          </Box>
        )}
        {nextValues.length > 0 &&
          nextValues[0] !== undefined &&
          nextValues[0].length > 0 && (
            <Box>
              <CopySuggested
                isInitialInteraction={dataPoints.length === 0}
                onClick={() =>
                  dispatchExperiment({
                    type: 'copySuggestedToDataPoints',
                    payload: [...Array(nextValues.length)].map((_, i) => i),
                  })
                }
              />
            </Box>
          )}
      </Box>

      {summary}
    </TitleCard>
  )
}
// value - 1.96 * std <-> value + 1.96 * std
const convertScoreToString = (data: number[]) => {
  const [value, stdDev] = data
  if (value && stdDev) {
    return `[${(-value - 1.96 * stdDev).toFixed(2)}, ${(
      -value +
      1.96 * stdDev
    ).toFixed(2)}]`
  }
  return ''
}

const convertExpectedMinimumToDisplayValue = (
  expectedMinimum: z.infer<typeof experimentResultSchema.shape.expectedMinimum>
) => {
  if (
    expectedMinimum.length === 2 &&
    isArray(expectedMinimum[0]) &&
    isArray(expectedMinimum[1])
  ) {
    return [
      expectedMinimum[0].concat(
        convertScoreToString(expectedMinimum[1] as number[])
      ),
    ]
  }
  return expectedMinimum ?? []
}
