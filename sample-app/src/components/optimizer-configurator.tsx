import { OptimizerConfig } from '@/types/common'
import { TitleCard } from './title-card/title-card'
import { TextField } from '@mui/material'
import { useGlobal } from '@/context/global'

type OptimizerConfiguratorProps = {
  config: OptimizerConfig
  onConfigUpdated: (config: OptimizerConfig) => void
}

export default function OptimizerConfigurator(
  props: OptimizerConfiguratorProps
) {
  const { config, onConfigUpdated } = props
  const {
    state: { debug },
  } = useGlobal()

  return (
    <TitleCard title="Configuration">
      <TextField
        name="acqFunc"
        disabled={!debug}
        fullWidth
        margin="dense"
        defaultValue={config.acqFunc}
        label="Acq func"
        onChange={e => onConfigUpdated({ ...config, acqFunc: e.target.value })}
      />
      <TextField
        name="initialPoints"
        fullWidth
        margin="dense"
        defaultValue={config.initialPoints}
        label="N initial points"
        onChange={e =>
          onConfigUpdated({
            ...config,
            initialPoints: parseInt(e.target.value),
          })
        }
      />
      <TextField
        name="kappa"
        fullWidth
        margin="dense"
        defaultValue={config.kappa}
        label="Kappa"
        onChange={e =>
          onConfigUpdated({ ...config, kappa: parseFloat(e.target.value) })
        }
      />
      <TextField
        name="xi"
        fullWidth
        margin="dense"
        defaultValue={config.xi}
        label="Xi"
        onChange={e =>
          onConfigUpdated({ ...config, xi: parseFloat(e.target.value) })
        }
      />
    </TitleCard>
  )
}
