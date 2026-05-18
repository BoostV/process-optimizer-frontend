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
} from '@boostv/process-optimizer-frontend-core'
import { useState } from 'react'
import { Box, Button } from '@mui/material'
import { groupSinglePlots } from '../../containers/result-data/experimentation-guide.utils'
import { z } from 'zod'
import { isArray } from 'remeda'
import useStyles from './result.style'

type ResultProps = {
  title?: string
  id?: string
  loading?: boolean
  loadingMode?: 'skeleton' | 'overlay' | 'custom'
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
}: ResultProps) => {
  const { classes } = useStyles()

  const {
    state: { experiment },
  } = useExperiment()

  const dataPoints = useSelector(selectActiveDataPoints)
  const variableHeaders = useSelector(selectActiveVariableNames)
  const scoreHeaders = useSelector(selectActiveScoreVariableLabels)
  const expectedMinimum = useSelector(selectExpectedMinimum)
  const isInitializing = useSelector(selectIsInitializing)
  const isMultiObjective = useSelector(selectIsMultiObjective)
  const activeVariables = selectActiveVariablesFromExperiment(experiment)
  const plots = useSelector(selectPlots)

  const [selectedParetoPoint, setSelectedParetoPoint] = useState<number | null>(
    null
  )

  const onSetSelectedParetoPoint = (index: number) => {
    setSelectedParetoPoint(index)
    // TODO: multi - dispatch based onpareto point selection change
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

  if (!showSingleDataPoint && !isMultiObjective) {
    return null
  }

  const paretoRaw = plots.find(
    plot => plot.id.includes('pareto') && typeof plot.plot === 'string'
  )
  const pareto = JSON.parse(paretoRaw?.plot ?? '{}')
  return (
    <TitleCard
      id={id}
      title={title}
      padding={0}
      loading={loading}
      loadingMode={loadingMode}
    >
      {showSingleDataPoint && (
        <Box className={classes.container}>
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
      )}
      {isMultiObjective && (
        <Box p={2} className={classes.paretoContainer}>
          <ParetoFrontPlot
            onSelectIndex={onSetSelectedParetoPoint}
            indexOfSelected={selectedParetoPoint ?? pareto.best_idx}
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
            onResetToDefault={() => onSetSelectedParetoPoint(pareto.best_idx)}
          />
        </Box>
      )}
    </TitleCard>
  )
}
