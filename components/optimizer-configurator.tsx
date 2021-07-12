import { TextField } from '@material-ui/core'
import { useForm } from 'react-hook-form';
import { OptimizerConfig } from '../types/common';
import { TitleCard } from './title-card';

type OptimizerConfiguratorProps = {
  config: OptimizerConfig,
  onConfigUpdated: (config: OptimizerConfig) => void,
}

export default function OptimizerConfigurator(props: OptimizerConfiguratorProps) {
  const { config , onConfigUpdated} = props
  const { register, handleSubmit, reset, watch, errors, getValues } = useForm<OptimizerConfig>()

  const handleChange = () => {
    onConfigUpdated(getValues() as OptimizerConfig)
  }

  return (
    <TitleCard title="Configuration">
      <TextField
        disabled
        fullWidth
        margin="dense"
        defaultValue={config.baseEstimator}
        name="baseEstimator"
        label="Base estimator"
        inputRef={register}
        onChange={handleChange}
      />
      <TextField
        disabled
        fullWidth
        margin="dense"
        defaultValue={config.acqFunc}
        name="acqFunc"
        label="Acq func"
        inputRef={register}
        onChange={handleChange}
      />
      <TextField
        fullWidth
        margin="dense"
        defaultValue={config.initialPoints}
        name="initialPoints"
        label="N initial points"
        inputRef={register}
        onChange={handleChange}
      />
      <TextField
        fullWidth
        margin="dense"
        defaultValue={config.kappa}
        name="kappa"
        label="Kappa"
        inputRef={register}
        onChange={handleChange}
      />
      <TextField
        fullWidth
        margin="dense"
        defaultValue={config.xi}
        name="xi"
        label="Xi"
        inputRef={register}
        onChange={handleChange}
      />
    </TitleCard>
  )
}
