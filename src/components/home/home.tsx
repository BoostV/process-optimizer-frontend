import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Typography,
} from '@mui/material'
import { MouseEvent, useCallback, useReducer, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Layout from '../layout/layout'
import useStyles from './home.style'
import { NextRouter, useRouter } from 'next/router'
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DeleteIcon from '@mui/icons-material/Delete'
import { buildPath, paths } from '../../../paths'
import { ExperimentType } from '../../types/common'
import { useGlobal } from '../../context/global'
import { v4 as uuid } from 'uuid'
import { reducer } from './home-reducer'
import { CreateOrOverwriteDialog } from '../create-or-overwrite-dialog/create-or-overwrite-dialog'

type UploadMessage = {
  message: string
  isError: boolean
}

export default function Home() {
  const classes = useStyles()
  const router: NextRouter = useRouter()
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
      router.push(buildPath(paths.experiment, experiment.id))
    },
    [router]
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
          console.error('Unable to use local storage')
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
    router.push(buildPath(paths.experiment, uuid()))
  }

  const openSavedExperiment = (key: string) => {
    deleteExperiments()
    router.push(buildPath(paths.experiment, key))
  }

  const getExperimentName = (key: string) => {
    try {
      const json: any = JSON.parse(localStorage.getItem(key) ?? '')
      const experiment: ExperimentType = json.experiment
      return '' !== experiment.info.name ? experiment.info.name : '-'
    } catch (e) {
      console.error('Error parsing saved experiment')
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
              <ListItem button onClick={() => createNewExperiment()}>
                <ListItemText
                  primaryTypographyProps={{ variant: 'h6' }}
                  primary="Create new experiment"
                />
                <ChevronRightIcon />
              </ListItem>
            </List>
          </Box>

          <Box p={3} pb={1} mb={1} className={classes.box}>
            <Typography variant="h6">Upload experiment file</Typography>
            <Box mb={5} className={classes.uploadBox} {...getRootProps()}>
              <SystemUpdateAltIcon className={classes.uploadIcon} />
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
                      <ListItem
                        key={i}
                        button
                        onClick={() => openSavedExperiment(id)}
                      >
                        <ListItemIcon>
                          <IconButton
                            edge="start"
                            onClick={(e: MouseEvent) => deleteExperiment(e, id)}
                            size="large"
                          >
                            <DeleteIcon color="secondary" fontSize="small" />
                          </IconButton>
                        </ListItemIcon>
                        <ListItemText
                          primary={getExperimentName(id)}
                          secondary={id}
                          secondaryTypographyProps={{ color: 'inherit' }}
                        />
                        <ChevronRightIcon />
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
