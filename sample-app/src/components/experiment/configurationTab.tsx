import { Grid } from '@mui/material'
import { useExperiment } from '@process-optimizer-frontend/core'
import { useGlobal, useSelector } from '@sample/context/global'
import { Details } from '@process-optimizer-frontend/core'
import { OptimizerModel } from '@process-optimizer-frontend/core'
import { selectAdvancedConfiguration } from '@sample/context/global/global-selectors'
import {
  CategoricalVariableType,
  OptimizerConfig,
  ValueVariableType,
} from '@process-optimizer-frontend/core'
import { OptimizerConfigurator } from '@process-optimizer-frontend/core'

export const ConfigurationTab = () => {
  const {
    state: { experiment },
    dispatch,
  } = useExperiment()
  const {
    state: { debug },
  } = useGlobal()

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
            debug={debug}
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
