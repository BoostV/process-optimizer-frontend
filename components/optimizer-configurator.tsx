import { Box, Card, CardContent, Popover, Typography } from '@material-ui/core'
import { useForm } from 'react-hook-form';
import { OptimizerConfig } from '../types/common';
import { MouseEvent, useState } from 'react';
import InputWithHelp from './input-with-help';

type OptimizerConfiguratorProps = {
  config: OptimizerConfig,
  onConfigUpdated: (config: OptimizerConfig) => void,
}

export default function OptimizerConfigurator(props: OptimizerConfiguratorProps) {
  const { config , onConfigUpdated} = props
  const { register, handleSubmit, reset, watch, errors, getValues } = useForm<OptimizerConfig>()
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [helpText, setHelpText] = useState("")

  const handleChange = () => {
    onConfigUpdated(getValues() as OptimizerConfig)
  }

  const handleHelpClick = (event: MouseEvent<HTMLElement>, helpText: string) => {
    setHelpText(helpText)
    setPopoverOpen(true)
    setPopoverAnchor(event.currentTarget);
  };

  const handleHelpClose = (event: MouseEvent<HTMLElement>) => {
    setPopoverOpen(false)
    setPopoverAnchor(null);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Configuration</Typography>

        <InputWithHelp
          id="baseEstimator"
          label="Base estimator"
          defaultValue={config.baseEstimator}
          helpText="The base estimator."
          onHelpClick={(e: MouseEvent<HTMLElement>, helpText: string) => handleHelpClick(e, helpText)}
          onChange={handleChange}
          register={register}
          disabled={true}
        />

        <InputWithHelp
          id="acqFunc"
          label="Acq func"
          defaultValue={config.acqFunc}
          helpText="The acq func."
          onHelpClick={(e: MouseEvent<HTMLElement>, helpText: string) => handleHelpClick(e, helpText)}
          onChange={handleChange}
          register={register}
          disabled={true}
        />

        <InputWithHelp
          id="initialPoints"
          label="Initial points"
          defaultValue={config.initialPoints}
          helpText="The number of initial points."
          onHelpClick={(e: MouseEvent<HTMLElement>, helpText: string) => handleHelpClick(e, helpText)}
          onChange={handleChange}
          register={register}
        />

        <InputWithHelp
          id="kappa"
          label="Kappa"
          defaultValue={config.kappa}
          helpText="The kappa value."
          onHelpClick={(e: MouseEvent<HTMLElement>, helpText: string) => handleHelpClick(e, helpText)}
          onChange={handleChange}
          register={register}
        />

        <InputWithHelp
          id="xi"
          label="Xi"
          defaultValue={config.xi}
          helpText="The xi value."
          onHelpClick={(e: MouseEvent<HTMLElement>, helpText: string) => handleHelpClick(e, helpText)}
          onChange={handleChange}
          register={register}
        />

        <Popover
          open={popoverOpen}
          anchorEl={popoverAnchor}
          onClose={handleHelpClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Box p={1}>
            <Typography variant="body2">{helpText}</Typography>
          </Box>
      </Popover>

      </CardContent>
    </Card>
  )
}
