import { LinearProgress, Typography } from '@mui/material'
import { useExperiment } from '../../context/experiment-context'

export const InitializationProgress = () => {
  const {
    state: {
      experiment: { optimizerConfig, dataPoints },
    },
  } = useExperiment()
  const progress = (dataPoints.length / optimizerConfig.initialPoints) * 100.0
  return (
    <>
      <Typography variant="h1">
        {dataPoints.length}/{optimizerConfig.initialPoints}
      </Typography>
      <LinearProgress variant="determinate" value={progress} />
    </>
  )
}
