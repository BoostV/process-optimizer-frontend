import { useForm } from 'react-hook-form';
import InputWithHelp from './input-with-help';
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

        <InputWithHelp
          id="baseEstimator"
          label="Base estimator"
          defaultValue={config.baseEstimator}
          helpText="The base estimator."
          onChange={handleChange}
          register={register}
          disabled={true}
        />

        <InputWithHelp
          id="acqFunc"
          label="Acq func"
          defaultValue={config.acqFunc}
          helpText="The acq func."
          onChange={handleChange}
          register={register}
          disabled={true}
        />

        <InputWithHelp
          id="initialPoints"
          label="Initial points"
          defaultValue={config.initialPoints}
          helpText="The number of initial points."
          onChange={handleChange}
          register={register}
        />

        <InputWithHelp
          id="kappa"
          label="Kappa"
          defaultValue={config.kappa}
          helpText="The kappa value."
          onChange={handleChange}
          register={register}
        />

        <InputWithHelp
          id="xi"
          label="Xi"
          defaultValue={config.xi}
          helpText="The xi value."
          onChange={handleChange}
          register={register}
        />

    </TitleCard>
  )
}
