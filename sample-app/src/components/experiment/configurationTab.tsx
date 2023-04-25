import { Grid } from '@mui/material'
import { useExperiment } from '@boostv/process-optimizer-frontend-core'
import { useGlobal, useSelector } from '@sample/context/global'
import {
  OptimizerConfigurator,
  InputModel,
  Details,
} from '@boostv/process-optimizer-frontend-ui'
import { selectAdvancedConfiguration } from '@sample/context/global/global-selectors'
import {
  CategoricalVariableType,
  OptimizerConfig,
  ValueVariableType,
} from '@boostv/process-optimizer-frontend-core'

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
  const dataPoints = experiment.dataPoints

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
        <InputModel
          isAddRemoveDisabled={dataPoints.length > 0}
          valueVariables={valueVariables}
          categoricalVariables={categoricalVariables}
          onDeleteValueVariable={(index: number) => {
            dispatch({
              type: 'deleteValueVariable',
              payload: index,
            })
          }}
          onDeleteCategoricalVariable={(index: number) => {
            dispatch({
              type: 'deleteCategorialVariable',
              payload: index,
            })
          }}
          addValueVariable={(valueVariable: ValueVariableType) =>
            dispatch({
              type: 'addValueVariable',
              payload: valueVariable,
            })
          }
          editValueVariable={(
            index: number,
            oldName: string,
            newVariable: ValueVariableType
          ) =>
            dispatch({
              type: 'editValueVariable',
              payload: {
                index,
                oldName,
                newVariable,
              },
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
          editCategoricalVariable={(
            index: number,
            oldName: string,
            newVariable: CategoricalVariableType
          ) =>
            dispatch({
              type: 'editCategoricalVariable',
              payload: {
                index,
                oldName,
                newVariable,
              },
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
