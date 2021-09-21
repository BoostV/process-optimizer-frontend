import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { OptimizerConfig } from '../types/common';
import { TitleCard } from './title-card/title-card';
import { FormInputText } from '../utility/forms';

type OptimizerConfiguratorProps = {
  config: OptimizerConfig,
  onConfigUpdated: (config: OptimizerConfig) => void,
}

export default function OptimizerConfigurator(props: OptimizerConfiguratorProps) {
  const { config , onConfigUpdated} = props
  const { getValues, control, watch } = useForm<OptimizerConfig>()

  useEffect(() => {
    const subscription = watch(() => onConfigUpdated({...config, ...getValues()}))
    return () => subscription.unsubscribe()
  }, [config, getValues, onConfigUpdated, watch])

  return (
    <TitleCard title="Configuration">
      <FormInputText
        name="baseEstimator"
        control={control} 
        disabled
        fullWidth
        margin="dense"
        defaultValue={config.baseEstimator}
        label="Base estimator"
      />
      <FormInputText
        name="acqFunc"
        control={control} 
        disabled
        fullWidth
        margin="dense"
        defaultValue={config.acqFunc}
        label="Acq func"
      />
      <FormInputText 
        name="initialPoints" 
        control={control} 
        fullWidth
        margin="dense"
        defaultValue={config.initialPoints}
        label="N initial points" />
      <FormInputText
        name="kappa"
        control={control} 
        fullWidth
        margin="dense"
        defaultValue={config.kappa}
        label="Kappa"
      />
      <FormInputText
        name="xi"
        control={control} 
        fullWidth
        margin="dense"
        defaultValue={config.xi}
        label="Xi"
      />
    </TitleCard>
  )
}
