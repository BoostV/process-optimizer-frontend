import {
  ParetoFrontPlot,
  OneDData,
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
  costDomain,
  displayQualityCI,
  selectActiveScoreVariableNames,
  type SelectedPoint,
} from '@boostv/process-optimizer-frontend-core'
import { Box, Button } from '@mui/material'
import {
  flipQualityScores,
  groupSinglePlots,
  parsePlotJson,
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

  // A single-objective experiment has no pareto plot; it still renders the
  // "Predicted best solution" panel (with its PNG plots) below. Only the
  // multi-objective ParetoFrontPlot rendering requires `pareto`.
  const cost = pareto ? costDomain(pareto) : undefined

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
          <Box className={classes.container}>
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
                    return plot.map(p => {
                      if (typeof p === 'string') {
                        return p
                      }
                      const flipped = flipQualityScores(p)
                      if (flipped.type !== 'score') {
                        return flipped
                      }
                      const xs = flipped.points
                        .map(pt => (typeof pt.x === 'number' ? pt.x : NaN))
                        .filter(n => !Number.isNaN(n))
                      const maxX = xs.length ? Math.max(...xs) : 0
                      return {
                        ...flipped,
                        xDomain: [0, Math.max(5, maxX)] as [number, number],
                      }
                    })
                  }
                  if (isCost && cost) {
                    return plot.map(p => {
                      if (typeof p === 'string' || p.type !== 'score') {
                        return p
                      }
                      return { ...p, xDomain: cost }
                    })
                  }
                  return plot
                })()
                return {
                  scoreHeader: `${header} (95% credible interval)`,
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
                      Reset to default
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
