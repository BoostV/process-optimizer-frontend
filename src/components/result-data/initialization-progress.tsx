import { Box, IconButton, LinearProgress, Typography } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
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
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="overline">Initializing model</Typography>
        <Typography variant="h4" sx={{ marginLeft: 2 }}>
          {dataPoints.length}/{optimizerConfig.initialPoints}
          <IconButton>
            <EditIcon fontSize="small" color="primary" />
          </IconButton>
        </Typography>
        <Typography variant="caption">date points added</Typography>
      </Box>
      <LinearProgress variant="determinate" value={progress} />
    </>
  )
}
