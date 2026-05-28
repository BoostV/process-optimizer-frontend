import {
  ParetoFrontPlot,
  paretoVisualizationModes,
  type ParetoVisualizationMode,
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
} from '@boostv/process-optimizer-frontend-core'
import { Box, Button, MenuItem, Select } from '@mui/material'
import { groupSinglePlots } from '../../containers/result-data/experimentation-guide.utils'
import { matchFrontIndex } from './result.utils'
import { z } from 'zod'
import { isArray } from 'remeda'
import { useState } from 'react'
import useStyles from './result.style'

type ResultProps = {
  title?: string
  id?: string
  loading?: boolean
  loadingMode?: 'skeleton' | 'overlay' | 'custom'
  styles?: {
    pareto?: {
      legendBorderColor?: string
    }
  }
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

// TODO: multi handle loading
export const Result = ({
  id,
  title = 'Results',
  loading,
  loadingMode,
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
  const expectedMinimum = useSelector(selectExpectedMinimum)
  const isInitializing = useSelector(selectIsInitializing)
  const isMultiObjective = useSelector(selectIsMultiObjective)
  const activeVariables = selectActiveVariablesFromExperiment(experiment)
  const plots = useSelector(selectPlots)

  const selectedCoords = experiment.extras.selectedPoint as
    | Array<number | string>
    | undefined

  const [paretoVizMode, setParetoVizMode] =
    useState<ParetoVisualizationMode>('ellipses')

  const onSetSelectedParetoPoint = (index: number) => {
    const coords = pareto.front_x_data[index]
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
  const pareto = JSON.parse(paretoRaw?.plot ?? '{}')

  if (Object.keys(pareto).length === 0) {
    return null
  }

  const costDomain: [number, number] | undefined = (() => {
    const frontPairs = pareto?.front_y_data
    const errs = pareto?.obj2_error
    if (!Array.isArray(frontPairs)) {
      return undefined
    }
    const getCostErr = (i: number) => {
      const e = Array.isArray(errs) ? errs[i] : undefined
      if (Array.isArray(e)) {
        return Number(e[0]) || 0
      }
      return Number(e) || 0
    }
    const frontLower = frontPairs.map(
      (p: number[], i: number) => (p[1] ?? 0) - getCostErr(i)
    )
    const frontUpper = frontPairs.map(
      (p: number[], i: number) => (p[1] ?? 0) + getCostErr(i)
    )
    const all = [...frontLower, ...frontUpper]
    if (all.length === 0) {
      return undefined
    }
    return [Math.min(...all), Math.max(...all)]
  })()

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
                const lower = header.toLowerCase()
                const isQuality = lower.includes('quality')
                const isCost = lower.includes('cost')
                const plotData: (string | OneDData)[] = (() => {
                  if (isQuality) {
                    return plot.map(p => {
                      if (typeof p === 'string' || p.type !== 'score') {
                        return p
                      }
                      const xs = p.points
                        .map(pt => (typeof pt.x === 'number' ? pt.x : NaN))
                        .filter(n => !Number.isNaN(n))
                      const maxX = xs.length ? Math.max(...xs) : 0
                      return {
                        ...p,
                        xDomain: [0, Math.max(5, maxX)] as [number, number],
                      }
                    })
                  }
                  if (isCost && costDomain) {
                    return plot.map(p => {
                      if (typeof p === 'string' || p.type !== 'score') {
                        return p
                      }
                      return { ...p, xDomain: costDomain }
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

          {isMultiObjective && (
            <Box p={2} className={classes.paretoContainer}>
              <ParetoFrontPlot
                onSelectIndex={onSetSelectedParetoPoint}
                indexOfSelected={
                  selectedCoords
                    ? (() => {
                        const idx = matchFrontIndex(
                          pareto.front_x_data,
                          selectedCoords
                        )
                        return idx >= 0 ? idx : pareto.best_idx
                      })()
                    : pareto.best_idx
                }
                plot={pareto}
                dataPoints={dataPoints}
                fitToFrontButton={
                  <Button variant="outlined" size="small">
                    Toggle front fit
                  </Button>
                }
                resetToDefaultButton={
                  <Button variant="outlined" size="small">
                    Reset to default
                  </Button>
                }
                onResetToDefault={() =>
                  dispatch({ type: 'setSelectedParetoPoint', payload: null })
                }
                visualizationMode={paretoVizMode}
                visualizationModeSelector={
                  <Select
                    size="small"
                    value={paretoVizMode}
                    onChange={e =>
                      setParetoVizMode(
                        e.target.value as ParetoVisualizationMode
                      )
                    }
                  >
                    {paretoVisualizationModes.map(m => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.label}
                      </MenuItem>
                    ))}
                  </Select>
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
