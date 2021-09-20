import { TextField } from '@material-ui/core'
import { useForm } from 'react-hook-form';
import { OptimizerConfig } from '../types/common';
import { TitleCard } from './title-card/title-card';

type OptimizerConfiguratorProps = {
  config: OptimizerConfig,
  onConfigUpdated: (config: OptimizerConfig) => void,
}

export default function OptimizerConfigurator(props: OptimizerConfiguratorProps) {
  const { config , onConfigUpdated} = props
  const { register, getValues } = useForm<OptimizerConfig>()

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
        label="Base estimator"
        {...register('baseEstimator')}
        onChange={handleChange}
      />
      <TextField
        disabled
        fullWidth
        margin="dense"
        defaultValue={config.acqFunc}
        label="Acq func"
        {...register('acqFunc')}
        onChange={handleChange}
      />
      <TextField
        fullWidth
        margin="dense"
        defaultValue={config.initialPoints}
        label="N initial points"
        {...register('initialPoints')}
        onChange={handleChange}
      />
      <TextField
        fullWidth
        margin="dense"
        defaultValue={config.kappa}
        label="Kappa"
        {...register('kappa')}
        onChange={handleChange}
      />
      <TextField
        fullWidth
        margin="dense"
        defaultValue={config.xi}
        label="Xi"
        {...register('xi')}
        onChange={handleChange}
      />
    </TitleCard>
  )
}
