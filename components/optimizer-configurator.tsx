import { OptimizerConfig } from "../types/common";
import { TitleCard } from "./title-card/title-card";
import { InputWithHelp } from "./input-with-help";

type OptimizerConfiguratorProps = {
  config: OptimizerConfig;
  onConfigUpdated: (config: OptimizerConfig) => void;
};

export default function OptimizerConfigurator(
  props: OptimizerConfiguratorProps
) {
  const { config, onConfigUpdated } = props;

  return (
    <TitleCard title="Configuration">

      <InputWithHelp
        defaultValue={config.baseEstimator}
        helpText="The base estimator."
        label="Base estimator"
        name="baseEstimator"
        disabled={true}
        onChange={(value) => onConfigUpdated({ ...config, baseEstimator: value })}
      />

      <InputWithHelp
        defaultValue={config.acqFunc}
        helpText="The acq func."
        label="Acq func"
        name="acqFunc"
        disabled={true}
        onChange={(value) => onConfigUpdated({ ...config, acqFunc: value })}
      />

      <InputWithHelp
        defaultValue={config.initialPoints}
        helpText="Number of initial points."
        label="N initial points"
        name="initialPoints"
        onChange={(value) => onConfigUpdated({ ...config, initialPoints: parseInt(value) })}
      />

      <InputWithHelp
        defaultValue={config.kappa}
        helpText="The kappa value."
        label="Kappa"
        name="kappa"
        onChange={(value) => onConfigUpdated({ ...config, kappa: parseFloat(value) })}
      />

      <InputWithHelp
        defaultValue={config.xi}
        helpText="The xi value."
        label="Xi"
        name="xi"
        onChange={(value) => onConfigUpdated({ ...config, xi: parseFloat(value) })}
      />

    </TitleCard>
  );
}
