import {
  ParetoFrontPlot,
  OneDData,
  usePlotColors,
} from '@boostv/process-optimizer-frontend-plots'
import { TitleCard } from '../core'
import { SingleDataPoint } from '../result-data/single-data-point'
import {
  selectActiveDataPoints,
  selectActiveVariableNames,
  selectActiveScoreVariableLabels,
  selectExpectedMinimum,
  selectIsInitializing,
  selectIsMultiObjective,
  selectActiveVariablesFromExperiment,
  selectPlots,
  useExperiment,
  useSelector,
  experimentResultSchema,
  parseParetoPlot,
  displayQuality,
  displayQualityCI,
  selectActiveScoreVariableNames,
  type SelectedPoint,
} from '@boostv/process-optimizer-frontend-core'
import { Box, Button, Chip, Typography } from '@mui/material'
import {
  flipQualityScores,
  groupSinglePlots,
  parsePlotJson,
  qualityDisplayDomain,
  costDisplayDomain,
} from '../../containers/result-data/experimentation-guide.utils'
import { resolveSelectedIndex } from './result.utils'
import { z } from 'zod'
import { isArray } from 'remeda'
import useStyles from './result.style'

type ResultProps = {
  title?: string
  id?: string
  loading?: boolean
  loadingMode?: 'skeleton' | 'overlay' | 'custom'
  // Opt in to the per-point 95% confidence ellipse shown on hover over the
  // Pareto front. Defaults to off.
  showParetoHoverEllipse?: boolean
  styles?: {
    pareto?: {
      legendBorderColor?: string
    }
  }
}

// value - 1.96 * std <-> value + 1.96 * std
const convertScoreToString = (data: number[]) =>
  displayQualityCI(data[0] ?? 0, data[1] ?? 0)

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

// TODO: multi handle loading
export const Result = ({
  id,
  title = 'Results',
  loading,
  loadingMode,
  showParetoHoverEllipse,
  styles,
}: ResultProps) => {
  const { classes } = useStyles()
  // Same accent as the "Selected" marker on the Pareto front, so the header chip
  // ties the 1D plots to the highlighted point. Themeable via palette.plots.
  const selectedAccent = usePlotColors().selectedPoint

  const {
    state: { experiment },
    dispatch,
  } = useExperiment()

  const dataPoints = useSelector(selectActiveDataPoints)
  const variableHeaders = useSelector(selectActiveVariableNames)
  const scoreHeaders = useSelector(selectActiveScoreVariableLabels)
  const scoreVarNames = useSelector(selectActiveScoreVariableNames)
  const expectedMinimum = useSelector(selectExpectedMinimum)
  const isInitializing = useSelector(selectIsInitializing)
  const isMultiObjective = useSelector(selectIsMultiObjective)
  const activeVariables = selectActiveVariablesFromExperiment(experiment)
  const plots = useSelector(selectPlots)

  const selectedCoords = experiment.extras.selectedPoint as
    | SelectedPoint
    | undefined

  const onSetSelectedParetoPoint = (index: number) => {
    const coords = pareto?.front_x_data[index]
    if (!coords) return
    dispatch({ type: 'setSelectedParetoPoint', payload: coords })
  }

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

  const rawOneDGroups = groupSinglePlots(plots, activeVariables)
  const oneDPlots: (string | OneDData)[][] = isMultiObjective
    ? rawOneDGroups.map(mapOptionsLabels)
    : [mapOptionsLabels(rawOneDGroups[0] ?? [])]

  const hasPlots = oneDPlots.length > 0
  const hasExpectedMinimum = !!(expectedMinimum && expectedMinimum.length > 0)
  const showSingleDataPoint =
    !isInitializing && (hasExpectedMinimum || hasPlots)

  const paretoRaw = plots.find(
    plot => plot.id.includes('pareto') && typeof plot.plot === 'string'
  )
  const pareto = parseParetoPlot(parsePlotJson(paretoRaw?.plot))

  // Which point on the Pareto front the 1D plots below describe: the user's
  // selection, or the model's optimal point (best_idx) by default.
  const selectedIndex = pareto
    ? resolveSelectedIndex(pareto.front_x_data, selectedCoords, pareto.best_idx)
    : -1
  const isDefaultSelection = pareto ? selectedIndex === pareto.best_idx : true
  const selectedScores = pareto?.front_y_data[selectedIndex]
  const selectedQuality = selectedScores
    ? displayQuality(selectedScores[0])
    : undefined
  const selectedCost = selectedScores ? selectedScores[1] : undefined

  return (
    <TitleCard
      id={id}
      title={title}
      padding={0}
      loading={loading}
      loadingMode={loadingMode}
    >
      {!showSingleDataPoint && (
        <Box className={classes.noResults}>No results to show yet</Box>
      )}
      {showSingleDataPoint && (
        <>
          <Box
            className={classes.container}
            sx={
              isMultiObjective && pareto && !isDefaultSelection
                ? { borderLeft: `4px solid ${selectedAccent}` }
                : undefined
            }
          >
            {isMultiObjective && pareto && (
              <Box className={classes.selectionHeader}>
                <Box className={classes.selectionTitleRow}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {isDefaultSelection
                      ? 'Model predictions at'
                      : 'Model predictions at'}
                  </Typography>
                  <Chip
                    size="small"
                    label={
                      isDefaultSelection ? 'Default point' : 'Selected point'
                    }
                    sx={{ bgcolor: selectedAccent, color: 'common.white' }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {isDefaultSelection ? (
                    'For the model’s default equal balance of quality and cost. Pick a point on the Pareto front below to target a different trade-off.'
                  ) : (
                    <>
                      {`${scoreHeaders[0] ?? 'Quality'} ≈ ${
                        selectedQuality?.toFixed(2) ?? '?'
                      }, ${scoreHeaders[1] ?? 'Cost'} ≈ ${
                        selectedCost?.toFixed(2) ?? '?'
                      } · selected on the Pareto front. `}
                      <Button
                        size="small"
                        variant="text"
                        onClick={() =>
                          dispatch({
                            type: 'setSelectedParetoPoint',
                            payload: null,
                          })
                        }
                        sx={{
                          p: 0,
                          minWidth: 0,
                          textTransform: 'none',
                          verticalAlign: 'baseline',
                        }}
                      >
                        Reset to the default balance
                      </Button>
                    </>
                  )}
                </Typography>
              </Box>
            )}
            <SingleDataPoint
              title={isMultiObjective ? undefined : 'Predicted best solution'}
              variableHeaders={variableHeaders}
              rows={oneDPlots.map((plot, index) => {
                const header = scoreHeaders[index] ?? ''
                const role = scoreVarNames[index]
                const isQuality = role === 'quality'
                const isCost = role === 'cost'
                const plotData: (string | OneDData)[] = (() => {
                  if (isQuality) {
                    // Quality is minimized as -quality, so its json plots come
                    // back negated — flip them back to display units.
                    const flippedPlots = plot.map(p =>
                      typeof p === 'string' ? p : flipQualityScores(p)
                    )
                    // Pin every quality plot to one shared scale so the
                    // per-factor Y axes and the histogram X axis line up (as
                    // the PNG does), instead of each axis auto-scaling on its
                    // own — which left the factors at 0-8 and the histogram on
                    // a narrow, hard-to-read range.
                    const domain = qualityDisplayDomain(flippedPlots)
                    return flippedPlots.map(p => {
                      if (typeof p === 'string') {
                        return p
                      }
                      return p.type === 'score'
                        ? {
                            ...p,
                            objective: 'quality' as const,
                            xDomain: domain,
                          }
                        : {
                            ...p,
                            objective: 'quality' as const,
                            yDomain: domain,
                          }
                    })
                  }
                  if (isCost) {
                    // Pin the cost factor Y axes and the histogram X axis to one
                    // shared, data-derived scale (like quality) so the 1D graphs
                    // and the histogram cover the same range — otherwise, away
                    // from the default point, the histogram (pinned to the front
                    // cost range) no longer matched the 1D graphs.
                    const domain = costDisplayDomain(plot)
                    return plot.map(p => {
                      if (typeof p === 'string') {
                        return p
                      }
                      return p.type === 'score'
                        ? { ...p, objective: 'cost' as const, xDomain: domain }
                        : { ...p, objective: 'cost' as const, yDomain: domain }
                    })
                  }
                  return plot
                })()
                return {
                  scoreHeader: `${header} (95% credible interval)`,
                  // Generic objective name (e.g. "Quality"/"Cost"), not the full label.
                  rowLabel: role
                    ? role.charAt(0).toUpperCase() + role.slice(1)
                    : header,
                  dataPoint: hasExpectedMinimum
                    ? convertExpectedMinimumToDisplayValue(expectedMinimum!)
                    : [],
                  plotData,
                }
              })}
            />
          </Box>

          {isMultiObjective && pareto && (
            <Box p={2} className={classes.paretoContainer}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 1 }}
              >
                Each point is a possible quality–cost trade-off. Click one to
                see the settings predicted to reach it — the graphs above update
                to match.
              </Typography>
              <ParetoFrontPlot
                onSelectIndex={onSetSelectedParetoPoint}
                indexOfSelected={resolveSelectedIndex(
                  pareto.front_x_data,
                  selectedCoords,
                  pareto.best_idx
                )}
                plot={pareto}
                dataPoints={dataPoints}
                showHoverEllipse={showParetoHoverEllipse}
                renderControls={({ onToggleFitToFront, onResetToDefault }) => (
                  <>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={onToggleFitToFront}
                    >
                      Toggle front fit
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={onResetToDefault}
                    >
                      Reset to default point
                    </Button>
                  </>
                )}
                onResetToDefault={() =>
                  dispatch({ type: 'setSelectedParetoPoint', payload: null })
                }
                styles={styles?.pareto}
              />
            </Box>
          )}
        </>
      )}
    </TitleCard>
  )
}
