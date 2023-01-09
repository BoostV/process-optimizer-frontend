import { Grid } from '@mui/material'
import {
  selectDataPoints,
  useExperiment,
  useSelector,
} from '@process-optimizer-frontend/core'
import { ExperimentationGuide } from '@sample/components/result-data/experimentation-guide'
import { DataEntry } from '@process-optimizer-frontend/core'
import { useGlobal } from '@sample/context/global'
import { DataPoints } from '@process-optimizer-frontend/core'

export const DataEntryTab = () => {
  const {
    state: { experiment },
    dispatch,
  } = useExperiment()
  const {
    dispatch: globalDispatch,
    state: { dataPointsNewestFirst },
  } = useGlobal()

  const dataPoints: DataEntry[] = useSelector(selectDataPoints)

  const valueVariables = experiment.valueVariables
  const categoricalVariables = experiment.categoricalVariables

  const headers = valueVariables
    .map((it: any) => it.name)
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
          experimentId={experiment.id}
          valueVariables={experiment.valueVariables}
          categoricalVariables={experiment.categoricalVariables}
          scoreVariables={experiment.scoreVariables}
          dataPoints={dataPoints}
          newestFirst={dataPointsNewestFirst}
          onToggleNewestFirst={() =>
            globalDispatch({
              type: 'setDataPointsNewestFirst',
              payload: !dataPointsNewestFirst,
            })
          }
          onUpdateDataPoints={dataPoints =>
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
