import { Typography } from '@material-ui/core'

type OptimizerConfiguratorProps = {
  data?: any,
}

export default function OptimizerConfigurator(props: OptimizerConfiguratorProps) {

  return (
      <>
        <Typography variant="h6" gutterBottom>
          Configure optimizer
        </Typography>
        Inputs
    </>
  )
}
