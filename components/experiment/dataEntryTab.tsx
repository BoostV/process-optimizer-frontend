import { Box, Grid } from '@material-ui/core'
import { useState } from 'react'
import { useExperiment } from '../../context/experiment-context'
import { DataPointType } from '../../types/common'
import DataPoints from '../data-points/data-points'
import { ResultData } from '../result-data/result-data'
import { SingleDataPoint } from '../result-data/single-data-point'
import { SummaryConfiguration } from '../summary-configuration'
import { TitleCard } from '../title-card/title-card'

export const DataEntryTab = () => {
  const {
    state: { experiment },
    dispatch,
  } = useExperiment()

  const valueVariables = experiment.valueVariables
  const categoricalVariables = experiment.categoricalVariables

  const headers = valueVariables
    .map(it => it.name)
    .concat(categoricalVariables.map(it => it.name))

  const nextValues: any[][] =
    experiment.results.next && Array.isArray(experiment.results.next[0])
      ? (experiment.results.next as unknown as any[][])
      : experiment.results.next
      ? [experiment.results.next]
      : []

  const expectedMinimum: any[][] = experiment.results.expectedMinimum

  const [highlightNextExperiments, setHighlightNextExperiments] =
    useState(false)

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <ResultData
          nextValues={nextValues}
          headers={headers}
          expectedMinimum={expectedMinimum}
          onMouseEnterExpand={() => setHighlightNextExperiments(true)}
          onMouseLeaveExpand={() => setHighlightNextExperiments(false)}
        />
      </Grid>

      <Grid item xs={12}>
        <DataPoints
          valueVariables={experiment.valueVariables}
          categoricalVariables={experiment.categoricalVariables}
          scoreVariables={experiment.scoreVariables}
          dataPoints={experiment.dataPoints}
          onUpdateDataPoints={(dataPoints: DataPointType[][]) =>
            dispatch({
              type: 'updateDataPoints',
              payload: dataPoints,
            })
          }
        />
      </Grid>
    </Grid>
  )
}
