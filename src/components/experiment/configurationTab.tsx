import { Grid } from '@mui/material'
import { useExperiment } from '../../context/experiment-context'
import { useGlobal } from '../../context/global-context'
import {
  ValueVariableType,
  CategoricalVariableType,
  OptimizerConfig,
} from '../../types/common'
import Details from '../details'
import OptimizerModel from '../input-model/optimizer-model'
import OptimizerConfigurator from '../optimizer-configurator'

export const ConfigurationTab = () => {
  const {
    state: { experiment },
    dispatch,
  } = useExperiment()
  const {
    state: {
      flags: { advancedConfiguration },
    },
  } = useGlobal()

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
