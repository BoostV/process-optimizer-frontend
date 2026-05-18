import {
  ParetoFrontPlot,
  OneDData,
} from '@boostv/process-optimizer-frontend-plots'
import { TitleCard } from '../core'
import { SingleDataPoint } from '../result-data/single-data-point'
import { paretoJson } from './demo-data'
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

// cast the dummy data. Real data will be zod parsed
const pareto = paretoJson as unknown as {
  front_x_data: number[][]
  front_y_data: [number, number][]
  obj1_error: [number, number, number][]
  obj2_error: [number, number, number][]
  obj1_1D_data: [[[number], [number], [number], number]]
  obj2_1D_data: [[[number], [number], [number], number]]
  obj1_mean: number
  obj1_std: number
  obj2_mean: number
  obj2_std: number
  best_idx: number
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

  // TODO: multi Remove dummy data
  // oneDPlots = isMultiObjective
  //   ? [
  //       // cost objective
  //       [
  //         {
  //           points: [
  //             { x: 0, y: 10 },
  //             { x: 1, y: 8 },
  //             { x: 2, y: 5 },
  //             { x: 3, y: 3 },
  //             { x: 4, y: 2 },
  //             { x: 5, y: 1.5 },
  //           ],
  //           type: 'numeric' as const,
  //           referenceLineX: 4,
  //         } satisfies OneDData,
  //         {
  //           points: [
  //             { x: 0, y: 9 },
  //             { x: 1, y: 7 },
  //             { x: 2, y: 6 },
  //             { x: 3, y: 4 },
  //             { x: 4, y: 3.5 },
  //             { x: 5, y: 3 },
  //           ],
  //           type: 'numeric' as const,
  //           referenceLineX: 3,
  //         } satisfies OneDData,
  //       ],
  //       // quality objective
  //       [
  //         {
  //           points: [
  //             { x: 0, y: 2 },
  //             { x: 1, y: 4 },
  //             { x: 2, y: 7 },
  //             { x: 3, y: 8.5 },
  //             { x: 4, y: 9 },
  //             { x: 5, y: 9.2 },
  //           ],
  //           type: 'numeric' as const,
  //           referenceLineX: 3,
  //         } satisfies OneDData,
  //         {
  //           points: [
  //             { x: 0, y: 3 },
  //             { x: 1, y: 5 },
  //             { x: 2, y: 6.5 },
  //             { x: 3, y: 7 },
  //             { x: 4, y: 8 },
  //             { x: 5, y: 8.5 },
  //           ],
  //           type: 'numeric' as const,
  //           referenceLineX: 4,
  //         } satisfies OneDData,
  //       ],
  //     ]
  //   : [
  //       // single objective
  //       [
  //         {
  //           points: [
  //             { x: 0, y: 10 },
  //             { x: 1, y: 8 },
  //             { x: 2, y: 5 },
  //             { x: 3, y: 3 },
  //             { x: 4, y: 2 },
  //             { x: 5, y: 1.5 },
  //           ],
  //           type: 'numeric' as const,
  //           referenceLineX: 4,
  //         } satisfies OneDData,
  //         {
  //           points: [
  //             { x: 0, y: 9 },
  //             { x: 1, y: 7 },
  //             { x: 2, y: 6 },
  //             { x: 3, y: 4 },
  //             { x: 4, y: 3.5 },
  //             { x: 5, y: 3 },
  //           ],
  //           type: 'numeric' as const,
  //           referenceLineX: 3,
  //         } satisfies OneDData,
  //       ],
  //     ]

  const hasPlots = oneDPlots.length > 0
  const hasExpectedMinimum = !!(expectedMinimum && expectedMinimum.length > 0)
  const showSingleDataPoint =
    !isInitializing && (hasExpectedMinimum || hasPlots)

  if (!showSingleDataPoint && !isMultiObjective) {
    return null
  }

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
