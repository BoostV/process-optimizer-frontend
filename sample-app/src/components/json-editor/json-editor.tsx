import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  TextareaAutosize,
  Typography,
} from '@mui/material'
import { ChangeEvent, useEffect, useState } from 'react'
import {
  useExperiment,
  ExperimentType,
  errorMessage,
  experimentSchema,
} from '@boostv/process-optimizer-frontend-core'
import useStyles from './json-editor.style'
import { Close } from '@mui/icons-material'
import { useGlobal } from '@sample/context/global'

const JsonEditor = () => {
  const { classes } = useStyles()
  const [errorMsg, setErrorMsg] = useState('')
  const [displayedExperiment, setDisplayedExperiment] = useState('')
  const {
    state: { experiment },
    dispatch,
    loading,
  } = useExperiment()
  const global = useGlobal()

  useEffect(() => {
    const displayedExperiment = displayedExperimentFromExperiment(experiment)
    setDisplayedExperiment(displayedExperiment)
  }, [experiment])

  const displayedExperimentFromExperiment = (
    experiment: ExperimentType
  ): string => {
    const results = {
      id: experiment.results.id,
      next: experiment.results.next,
      expectedMinimum: experiment.results.expectedMinimum,
      extras: experiment.results.extras,
    }
    return JSON.stringify({ ...experiment, results }, null, 2)
  }

  const experimentFromDisplayedExperiment = (displayedExperiment: string) => {
    const displayedExperimentObject = JSON.parse(displayedExperiment)
    return experimentSchema.parse({
      ...displayedExperimentObject,
      results: {
        ...displayedExperimentObject.results,
        pickled: experiment.results.pickled,
        plots: experiment.results.plots,
      },
    })
  }

  const handleSave = async () => {
    try {
      const experimentToSave =
        experimentFromDisplayedExperiment(displayedExperiment)
      dispatch({ type: 'updateExperiment', payload: experimentToSave })
      location.reload()
    } catch (e: unknown) {
      setErrorMsg(`Error: ${errorMessage(e)}`)
      console.error('Error editing json', e)
    }
  }

  return (
    <Card>
      <CardContent>
        <Box mb={2}>
          <IconButton
            size="small"
            onClick={() =>
              global.dispatch({ type: 'setShowJsonEditor', payload: false })
            }
          >
            <Close />
          </IconButton>
        </Box>
        {loading ? (
          'Loading...'
        ) : (
          <>
            <Box>
              <Typography variant="body2">
                Warning! Only edit this JSON if you know what you are doing.
              </Typography>
            </Box>
            <TextareaAutosize
              className={classes.textArea}
              value={displayedExperiment}
              onChange={(e: ChangeEvent) =>
                setDisplayedExperiment((e.target as HTMLInputElement).value)
              }
            />
            <Box>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleSave()}
              >
                Update experiment
              </Button>
            </Box>
            <Box mt={1}>
              <Typography variant="body2" color="error">
                {errorMsg}
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default JsonEditor
