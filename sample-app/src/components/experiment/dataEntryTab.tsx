import { Grid } from '@mui/material'
import {
  selectDataPoints,
  useExperiment,
  useSelector,
} from '@process-optimizer-frontend/core'
import { DataEntry } from '@process-optimizer-frontend/core'
import { useGlobal } from '@sample/context/global'
import {
  DataPoints,
  ExperimentationGuide,
} from '@process-optimizer-frontend/ui'

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

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <ExperimentationGuide />
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
