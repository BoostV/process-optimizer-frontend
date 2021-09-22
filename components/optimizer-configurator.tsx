import { OptimizerConfig } from "../types/common";
import { TitleCard } from "./title-card/title-card";
import { TextField } from "@material-ui/core";

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
      <TextField
        name="baseEstimator"
        disabled
        fullWidth
        margin="dense"
        defaultValue={config.baseEstimator}
        label="Base estimator"
        onChange={(e) =>
          onConfigUpdated({ ...config, baseEstimator: e.target.value })
        }
      />
      <TextField
        name="acqFunc"
        disabled
        fullWidth
        margin="dense"
        defaultValue={config.acqFunc}
        label="Acq func"
        onChange={(e) =>
          onConfigUpdated({ ...config, acqFunc: e.target.value })
        }
      />
      <TextField
        name="initialPoints"
        fullWidth
        margin="dense"
        defaultValue={config.initialPoints}
        label="N initial points"
        onChange={(e) =>
          onConfigUpdated({ ...config, initialPoints: Number.parseInt(e.target.value) })
        }
      />
      <TextField
        name="kappa"
        fullWidth
        margin="dense"
        defaultValue={config.kappa}
        label="Kappa"
        onChange={(e) =>
          onConfigUpdated({ ...config, kappa: Number.parseFloat(e.target.value) })
        }
      />
      <TextField
        name="xi"
        fullWidth
        margin="dense"
        defaultValue={config.xi}
        label="Xi"
        onChange={(e) =>
          onConfigUpdated({ ...config, xi: Number.parseFloat(e.target.value) })
        }
      />
    </TitleCard>
  );
}
