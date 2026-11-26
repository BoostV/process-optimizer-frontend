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
  displayScore,
  displayScoreCI,
  scoreDisplayName,
  scoreDefaults,
  selectActiveScoreVariables,
  type SelectedPoint,
  type DataEntry,
} from '@boostv/process-optimizer-frontend-core'
import { Box, Button, Chip, Typography } from '@mui/material'
import {
  groupSinglePlots,
  parsePlotJson,
} from '../../containers/result-data/experimentation-guide.utils'
import {
  objectivePlotData,
  resolveSelectedIndex,
  selectedPointCI,
} from './result.utils'
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

// Round a displayed setting to a readable precision (drops float noise like
// 3.6312481268983503 → 3.6312) while leaving categorical labels untouched.
const roundSetting = (v: number | string): number | string =>
  typeof v === 'number' ? Number(v.toFixed(4)) : v

// value - 1.96 * std <-> value + 1.96 * std
const convertScoreToString = (data: number[], maximize: boolean) =>
  displayScoreCI(data[0] ?? 0, data[1] ?? 0, maximize)

const convertExpectedMinimumToDisplayValue = (
  expectedMinimum: z.infer<typeof experimentResultSchema.shape.expectedMinimum>,
  maximize: boolean
) => {
  if (
    expectedMinimum.length === 2 &&
    isArray(expectedMinimum[0]) &&
    isArray(expectedMinimum[1])
  ) {
    return [
      (expectedMinimum[0] as (number | string)[])
        .map(roundSetting)
        .concat(convertScoreToString(expectedMinimum[1] as number[], maximize)),
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
  const activeScores = useSelector(selectActiveScoreVariables)
  // Short display names, e.g. "Quality"/"Cost" or the user's own names.
  const scoreNames = activeScores.map(scoreDisplayName)
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

  // Transfer the currently selected Pareto point's factor settings into a new,
  // unscored data point row (scores left blank, valid: false until measured) —
  // mirrors the reducer's `copySuggestedToDataPoints` row shape. Lets the user
  // queue a promising trade-off as an experiment to run.
  const onAddSelectedAsDataPoint = () => {
    if (!pareto || selectedIndex < 0) return
    const coords = pareto.front_x_data[selectedIndex]
    if (!coords) return
    const data = coords.flatMap((v, i): DataEntry['data'] => {
      const variable = activeVariables[i]
      if (variable === undefined) return []
      switch (variable.type) {
        case 'numeric':
          // Round to 4 significant digits — the raw front coordinates carry
          // full float precision, which is noise for a planned data point.
          return [
            {
              name: variable.name,
              value: Number(Number(v).toPrecision(4)),
              type: 'numeric',
            },
          ]
        case 'options': {
          // front_x_data stores categorical values as an option index; store
          // the resolved label, as the data table expects.
          const label = typeof v === 'number' ? (variable.options?.[v] ?? v) : v
          return [
            { name: variable.name, value: String(label), type: 'categorical' },
          ]
        }
        default:
          return []
      }
    })
    const nextId =
      dataPoints.length === 0
        ? 1
        : Math.max(...dataPoints.map(d => d.meta.id)) + 1
    const newRow: DataEntry = {
      meta: { id: nextId, enabled: true, valid: false },
      data,
    }
    dispatch({ type: 'updateDataPoints', payload: [...dataPoints, newRow] })
    experiment.scoreVariables.forEach(sv => {
      // Only enabled objectives, matching the table-add default path.
      if (sv.enabled && sv.scoreFunction !== undefined) {
        dispatch({
          type: 'updateDataPointResponses',
          payload: {
            metaId: nextId,
            scoreName: sv.name,
            useFunction: true,
            values: [],
          },
        })
      }
    })
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
  const selectedFirst = selectedScores
    ? displayScore(selectedScores[0], activeScores[0]?.maximize ?? true)
    : undefined
  const selectedSecond = selectedScores
    ? displayScore(selectedScores[1], activeScores[1]?.maximize ?? false)
    : undefined

  // "quality and cost" in running text; a user's own names are kept as written.
  const balanceNames = activeScores
    .map((sv, i) =>
      sv.label === scoreDefaults[sv.name].label
        ? (scoreNames[i] ?? '').toLowerCase()
        : (scoreNames[i] ?? '')
    )
    .join(' and ')

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
          {isMultiObjective && pareto && (
            <Box
              className={classes.paretoContainer}
              sx={{
                p: 2,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  display: 'block',
                  mb: 1,
                }}
              >
                Each point is a possible quality–cost trade-off. Click one to
                see the settings predicted to reach it — the graphs below update
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
                objectives={
                  activeScores[0] && activeScores[1]
                    ? [
                        {
                          label: scoreDisplayName(activeScores[0]),
                          maximize: activeScores[0].maximize,
                        },
                        {
                          label: scoreDisplayName(activeScores[1]),
                          maximize: activeScores[1].maximize,
                        },
                      ]
                    : undefined
                }
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
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={onAddSelectedAsDataPoint}
                    >
                      Add as data point
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
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 'bold',
                    }}
                  >
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
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  {isDefaultSelection ? (
                    `For the model’s default equal balance of ${balanceNames}. Pick a point on the Pareto front above to target a different trade-off.`
                  ) : (
                    <>
                      {`${scoreHeaders[0] ?? 'Quality'} ≈ ${
                        selectedFirst?.toFixed(2) ?? '?'
                      }, ${scoreHeaders[1] ?? 'Cost'} ≈ ${
                        selectedSecond?.toFixed(2) ?? '?'
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
                const score = activeScores[index]
                // Flip to display units when maximized, pin the objective's
                // plots to one shared scale, theme per objective.
                const plotData = objectivePlotData(plot, score)
                const dataPoint: (number | (string | number)[])[] = (() => {
                  // Multi-objective has no single-objective `expectedMinimum`.
                  // Mirror its display from the selected Pareto point: the
                  // settings at the reference line plus this objective's 95% CI.
                  if (isMultiObjective) {
                    if (!pareto || selectedIndex < 0) {
                      return []
                    }
                    const settings = (
                      pareto.front_x_data[selectedIndex] ?? []
                    ).map((v, i) => {
                      const options = activeVariables[i]?.options
                      const mapped =
                        typeof v === 'number' && options ? (options[v] ?? v) : v
                      return roundSetting(mapped)
                    })
                    const ci = score
                      ? selectedPointCI(
                          index,
                          score.maximize,
                          pareto,
                          selectedIndex
                        )
                      : ''
                    return [[...settings, ci]]
                  }
                  // Single-objective: the predicted best settings + its CI.
                  return hasExpectedMinimum
                    ? convertExpectedMinimumToDisplayValue(
                        expectedMinimum!,
                        activeScores[0]?.maximize ?? true
                      )
                    : []
                })()
                return {
                  scoreHeader: '95% credible interval',
                  // Short objective name (e.g. "Quality"/"Cost"), or the
                  // user's own name once it has been changed.
                  rowLabel: scoreNames[index] ?? header,
                  dataPoint,
                  plotData,
                }
              })}
            />
          </Box>
        </>
      )}
    </TitleCard>
  )
}
