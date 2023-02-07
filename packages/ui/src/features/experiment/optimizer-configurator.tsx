import { TitleCard } from '@ui/features/core/title-card/title-card'
import { TextField } from '@mui/material'
import { OptimizerConfig } from '@boostv/process-optimizer-frontend-core'
import { FC } from 'react'

type Props = {
  config: OptimizerConfig
  debug: boolean
  onConfigUpdated: (config: OptimizerConfig) => void
}

export const OptimizerConfigurator: FC<Props> = ({
  config,
  debug,
  onConfigUpdated,
}) => {
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
