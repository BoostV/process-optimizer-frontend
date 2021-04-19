import { Button, Card, CardContent, TextField, Typography } from '@material-ui/core'
import { useForm } from 'react-hook-form';
import { OptimizerConfig } from '../types/common';

type OptimizerConfiguratorProps = {
  config: OptimizerConfig,
  onConfigUpdated: (config: OptimizerConfig) => void,
}

export default function OptimizerConfigurator(props: OptimizerConfiguratorProps) {

  const { register, handleSubmit, reset, watch, errors } = useForm<OptimizerConfig>();
  const onSubmit = async (config: OptimizerConfig) => {
    props.onConfigUpdated({...config, baseEstimater: props.config.baseEstimater, acqFunc: props.config.acqFunc})
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Typography variant="h6" gutterBottom>Configure optimizer</Typography>

          <TextField
            disabled
            defaultValue={props.config.baseEstimater}
            name="baseEstimater"
            label="Base estimater"
            inputRef={register}
          />
          <br />
          <br />
          <TextField
            disabled
            defaultValue={props.config.acqFunc}
            name="acqFunc"
            label="Acq func"
            inputRef={register}
          />
          <br />
          <br />
          <TextField
            defaultValue={props.config.initialPoints}
            name="initialPoints"
            label="N initial points"
            inputRef={register}
          />
          <br />
          <br />
          <TextField
          defaultValue={props.config.kappa}
            name="kappa"
            label="Kappa"
            inputRef={register}
          />
          <br />
          <br />
          <TextField
            defaultValue={props.config.xi}
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
