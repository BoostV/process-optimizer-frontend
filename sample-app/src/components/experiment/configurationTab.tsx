import { Grid } from '@mui/material'
import { useExperiment } from '@/context/experiment'
import { useSelector } from '@/context/global'
import Details from '@process-optimizer-frontend/core/src/features/core/details'
import OptimizerModel from '@process-optimizer-frontend/core/src/features/input-model/optimizer-model'
import OptimizerConfigurator from '@/components/optimizer-configurator'
import { selectAdvancedConfiguration } from '@/context/global/global-selectors'
import {
  CategoricalVariableType,
  OptimizerConfig,
  ValueVariableType,
} from '@process-optimizer-frontend/core/src/common/types/common'

export const ConfigurationTab = () => {
  const {
    state: { experiment },
    dispatch,
  } = useExperiment()

  const advancedConfiguration = useSelector(selectAdvancedConfiguration)

  const valueVariables = experiment.valueVariables
  const categoricalVariables = experiment.categoricalVariables

  return (
    <Grid container spacing={3}>
      <Grid item xs="auto">
        <Details
          info={experiment.info}
          updateName={(name: string) =>
            dispatch({
              type: 'updateExperimentName',
              payload: name,
            })
          }
          updateDescription={(description: string) =>
            dispatch({
              type: 'updateExperimentDescription',
              payload: description,
            })
          }
        />
      </Grid>

      <Grid item xs={10} sm={6}>
        <OptimizerModel
          valueVariables={valueVariables}
          categoricalVariables={categoricalVariables}
          disabled={experiment.dataPoints.length > 0}
          onDeleteValueVariable={(valueVariable: ValueVariableType) => {
            dispatch({
              type: 'deleteValueVariable',
              payload: valueVariable,
            })
          }}
          onDeleteCategoricalVariable={(
            categoricalVariable: CategoricalVariableType
          ) => {
            dispatch({
              type: 'deleteCategorialVariable',
              payload: categoricalVariable,
            })
          }}
          addValueVariable={(valueVariable: ValueVariableType) =>
            dispatch({
              type: 'addValueVariable',
              payload: valueVariable,
            })
          }
          addCategoricalVariable={(
            categoricalVariable: CategoricalVariableType
          ) =>
            dispatch({
              type: 'addCategorialVariable',
              payload: categoricalVariable,
            })
          }
        />
      </Grid>
      {advancedConfiguration && (
        <Grid item xs>
          <OptimizerConfigurator
            config={experiment.optimizerConfig}
            onConfigUpdated={(config: OptimizerConfig) =>
              dispatch({
                type: 'updateConfiguration',
                payload: config,
              })
            }
          />
        </Grid>
      )}
    </Grid>
  )
}
