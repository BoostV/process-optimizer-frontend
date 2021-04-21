import { Button, Card, CardContent, TextField, Typography } from '@material-ui/core'
import { useForm } from 'react-hook-form';
import { OptimizerConfig } from '../types/common';

type OptimizerConfiguratorProps = {
  config: OptimizerConfig,
  onConfigUpdated: (config: OptimizerConfig) => void,
}

export default function OptimizerConfigurator(props: OptimizerConfiguratorProps) {
  const { config } = props
  const { register, handleSubmit, reset, watch, errors } = useForm<OptimizerConfig>();
  const onSubmit = async (config: OptimizerConfig) => {
    props.onConfigUpdated({...config, baseEstimator: props.config.baseEstimator, acqFunc: props.config.acqFunc})
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Typography variant="h6" gutterBottom>Configure optimizer</Typography>

          <TextField
            disabled
            defaultValue={config.baseEstimator}
            name="baseEstimator"
            label="Base estimator"
            inputRef={register}
          />
          <br />
          <br />
          <TextField
            disabled
            defaultValue={config.acqFunc}
            name="acqFunc"
            label="Acq func"
            inputRef={register}
          />
          <br />
          <br />
          <TextField
            defaultValue={config.initialPoints}
            name="initialPoints"
            label="N initial points"
            inputRef={register}
          />
          <br />
          <br />
          <TextField
          defaultValue={config.kappa}
            name="kappa"
            label="Kappa"
            inputRef={register}
          />
          <br />
          <br />
          <TextField
            defaultValue={config.xi}
            name="xi"
            label="Xi"
            inputRef={register}
          />
          <br/>
          <br/>
          <Button variant="outlined" type="submit">Update</Button>
        </form>
      </CardContent>
    </Card>
  )
}
