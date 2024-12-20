import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Typography,
} from '@mui/material'
import { MouseEvent, useCallback, useReducer, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Layout from '@sample/components/layout/layout'
import useStyles from './home.style'
import { SystemUpdateAlt, ChevronRight, Delete } from '@mui/icons-material'
import { useGlobal } from '@sample/context/global'
import { v4 as uuid } from 'uuid'
import { reducer } from './home-reducer'
import { CreateOrOverwriteDialog } from './create-or-overwrite-dialog'
import { useNavigate } from 'react-router-dom'
import { ExperimentType } from '@boostv/process-optimizer-frontend-core'

type UploadMessage = {
  message: string
  isError: boolean
}

export default function Home() {
  const navigate = useNavigate()
  const { classes } = useStyles()
  const { state, dispatch } = useGlobal()
  const [isSnackbarOpen, setSnackbarOpen] = useState(false)
  const [deletionState, dispatchDeletion] = useReducer(reducer, {
    experimentsToDelete: [],
  })
  const [uploadMessage, setUploadMessage] = useState<UploadMessage>({
    message: 'Drag file here',
    isError: false,
  })
  const [tempExperiment, setTempExperiment] = useState<ExperimentType>()

  const saveExperimentLocally = useCallback(
    (experiment: ExperimentType) => {
      localStorage.setItem(experiment.id, JSON.stringify({ experiment }))
      navigate('/experiment/' + experiment.id)
    },
    [navigate]
  )

  const onDrop = useCallback(
    (acceptedFiles: Blob[]) => {
      const saveAndRedirect = async (experiment: ExperimentType) => {
        const id: string = experiment.id
        try {
          const existingExperiment =
            state.experimentsInLocalStorage.includes(id)
          if (!existingExperiment) {
            saveExperimentLocally(experiment)
          } else {
            setTempExperiment(experiment)
          }
        } catch (e) {
          console.error('Unable to use local storage', e)
          setUploadMessage({ message: 'Upload failed', isError: true })
        }
      }

      const load = (reader: FileReader) => {
        const binaryResult: string | ArrayBuffer | null = reader.result
        try {
          const experiment: ExperimentType = JSON.parse(binaryResult as string)
          if (experiment.id === undefined) {
            setUploadMessage({ message: 'Id not found', isError: true })
          } else {
            saveAndRedirect(experiment)
          }
        } catch (e) {
          console.error('File parsing failed', e)
          setUploadMessage({ message: 'Unknown file', isError: true })
        }
      }

      const reader = new FileReader()
      reader.onabort = () =>
        setUploadMessage({ message: 'Upload aborted', isError: false })
      reader.onerror = () =>
        setUploadMessage({ message: 'Upload failed', isError: true })
      reader.onprogress = () =>
        setUploadMessage({ message: 'Loading file...', isError: false })
      reader.onload = () => load(reader)
      const file = acceptedFiles[0]
      if (file) {
        reader.readAsText(file)
      }
    },
    [saveExperimentLocally, state.experimentsInLocalStorage]
  )

  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  const createNewExperiment = () => {
    deleteExperiments()
    navigate('/experiment/' + uuid())
  }

  const openSavedExperiment = (key: string) => {
    deleteExperiments()
    console.log('TODO route to ' + key)
    navigate('/experiment/' + key)
  }

  const getExperimentName = (key: string) => {
    try {
      const json = JSON.parse(localStorage.getItem(key) ?? '')
      const experiment: ExperimentType = json.experiment
      return '' !== experiment.info.name ? experiment.info.name : '-'
    } catch (e) {
      console.error('Error parsing saved experiment', e)
    }
    return key
  }

  const deleteExperiment = (e: MouseEvent, id: string) => {
    e.stopPropagation()
    dispatchDeletion({ type: 'addExperimentForDeletion', payload: id })
    setSnackbarOpen(true)
  }

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
    deleteExperiments()
  }

  const handleCancelDialog = () => {
    setTempExperiment(undefined)
    setUploadMessage({ message: 'Upload cancelled', isError: false })
  }

  const handleOverwriteDialog = () => {
    if (tempExperiment) {
      saveExperimentLocally(tempExperiment)
    }
    setTempExperiment(undefined)
  }

  const handleCreateDialog = () => {
    if (tempExperiment) {
      saveExperimentLocally({ ...tempExperiment, id: uuid() })
    }
    setTempExperiment(undefined)
  }

  const deleteExperiments = () => {
    const experimentsToDelete: string[] = deletionState.experimentsToDelete
    if (experimentsToDelete.length > 0) {
      experimentsToDelete.forEach(id => {
        dispatch({ type: 'deleteExperimentId', payload: id })
        localStorage.removeItem(id)
      })
      dispatchDeletion({ type: 'resetExperimentsForDeletion' })
    }
  }

  const undoDeleteExperiment = () => {
    dispatchDeletion({ type: 'resetExperimentsForDeletion' })
    setSnackbarOpen(false)
  }

  return (
    <Layout>
      <Card className={classes.mainContainer}>
        <CardContent className={classes.mainContent}>
          <Box p={3}>
            <Typography variant="h4">Get started</Typography>
          </Box>

          <Box p={0} pl={1} mb={1} className={classes.box}>
            <List component="nav">
              <ListItem component="div">
                <ListItemButton onClick={() => createNewExperiment()}>
                  <ListItemText
                    primaryTypographyProps={{ variant: 'h6' }}
                    primary="Create new experiment"
                  />
                  <ChevronRight />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>

          <Box p={3} pb={1} mb={1} className={classes.box}>
            <Typography variant="h6">Upload experiment file</Typography>
            <Box mb={5} className={classes.uploadBox} {...getRootProps()}>
              <SystemUpdateAlt className={classes.uploadIcon} />
              <input {...getInputProps()} />
              <div className={classes.uploadBoxInner}>
                <Typography
                  variant="body1"
                  color={uploadMessage.isError ? 'error' : 'inherit'}
                >
                  <b>{uploadMessage.message}</b>
                </Typography>
              </div>
            </Box>
          </Box>

          <Box p={3} className={classes.box}>
            <Typography variant="h6">Saved experiments</Typography>
            <Box mb={1}>
              {state.experimentsInLocalStorage.length > 0 ? (
                <List component="nav">
                  {state.experimentsInLocalStorage
                    .filter(
                      id => deletionState.experimentsToDelete.indexOf(id) === -1
                    )
                    .map((id, i) => (
                      <ListItem key={i} disablePadding>
                        <ListItemButton onClick={() => openSavedExperiment(id)}>
                          <ListItemIcon>
                            <IconButton
                              edge="start"
                              onClick={(e: MouseEvent) =>
                                deleteExperiment(e, id)
                              }
                              size="large"
                            >
                              <Delete color="secondary" fontSize="small" />
                            </IconButton>
                          </ListItemIcon>
                          <ListItemText
                            primary={getExperimentName(id)}
                            secondary={id}
                            secondaryTypographyProps={{ color: 'inherit' }}
                          />
                          <ChevronRight />
                        </ListItemButton>
                      </ListItem>
                    ))}
                </List>
              ) : (
                <Typography variant="body2">
                  There are no saved experiments
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message={
          <>
            <Typography variant="body1">
              {`Experiment${
                deletionState.experimentsToDelete.length > 1 ? 's' : ''
              } deleted:`}
            </Typography>
            {deletionState.experimentsToDelete.map((e, i) => (
              <Typography key={i} variant="body2">
                {e}
              </Typography>
            ))}
          </>
        }
        action={
          <Button
            color="secondary"
            size="small"
            onClick={() => undoDeleteExperiment()}
          >
            Undo
          </Button>
        }
      />
      <CreateOrOverwriteDialog
        open={Boolean(tempExperiment)}
        handleCancel={handleCancelDialog}
        handleOverwrite={handleOverwriteDialog}
        handleCreate={handleCreateDialog}
      />
    </Layout>
  )
}
