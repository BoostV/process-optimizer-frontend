import {
  Box,
  IconButton,
  LinearProgress,
  TextField,
  Typography,
} from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import { useExperiment } from '@/context/experiment'
import { useEffect, useState } from 'react'

export const InitializationProgress = () => {
  const {
    state: {
      experiment: { optimizerConfig, dataPoints },
    },
    dispatch,
  } = useExperiment()
  const [editActive, setEditActive] = useState(false)
  const [initialPoints, setInitialPoints] = useState(
    optimizerConfig.initialPoints
  )
  useEffect(
    () => setInitialPoints(optimizerConfig.initialPoints),
    [optimizerConfig.initialPoints]
  )
  const progress = (dataPoints.length / optimizerConfig.initialPoints) * 100.0
  const handleInitialPointsChanged = (newValue: number) =>
    dispatch({
      type: 'updateConfiguration',
      payload: { ...optimizerConfig, initialPoints: newValue },
    })
  if (editActive) {
    return (
      <>
        <Box sx={{ textAlign: 'center' }}>
          <TextField
            sx={{ marginBottom: 2 }}
            name="initialPoints"
            value={initialPoints}
            label="N initial points"
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            onChange={e =>
              e.target.value
                ? setInitialPoints(parseInt(e.target.value))
                : setInitialPoints(0)
            }
          />
          <IconButton
            sx={{ marginTop: 1 }}
            onClick={() => {
              handleInitialPointsChanged(initialPoints)
              setEditActive(!editActive)
            }}
          >
            <CheckIcon fontSize="small" color="primary" />
          </IconButton>
        </Box>
        <LinearProgress variant="determinate" value={progress} />
      </>
    )
  }

  return (
    <>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="overline">Initializing model</Typography>

        <Typography
          variant="h4"
          sx={{ cursor: 'pointer' }}
          onClick={() => setEditActive(!editActive)}
        >
          {dataPoints.length}/{optimizerConfig.initialPoints}
        </Typography>
        <Typography variant="caption">data points added</Typography>
      </Box>
      <LinearProgress variant="determinate" value={progress} />
    </>
  )
}
