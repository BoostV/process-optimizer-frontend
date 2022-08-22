import { Grid } from '@mui/material'
import { useExperiment } from '@/context/experiment'
import { DataPointType } from '@/types/common'
import DataPoints from '@/components/data-points/data-points'
import { ExperimentationGuide } from '@/components/result-data/experimentation-guide'

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

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <ExperimentationGuide
          nextValues={nextValues}
          headers={headers}
          expectedMinimum={expectedMinimum}
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
