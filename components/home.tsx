import { Box, Button, Card, CardContent, IconButton, List, ListItem, ListItemIcon, ListItemText, Snackbar, Typography } from "@material-ui/core";
import { MouseEvent, useCallback, useReducer, useState } from "react";
import { useDropzone } from 'react-dropzone';
import Layout from "../components/layout";
import useStyles from "../styles/home.style";
import { NextRouter, useRouter } from 'next/router'
import SystemUpdateAltIcon from '@material-ui/icons/SystemUpdateAlt';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import DeleteIcon from '@material-ui/icons/Delete';
import { paths } from "../paths";
import { ExperimentType } from "../types/common";
import { useGlobal } from "../context/global-context";
import { saveExperiment } from '../context/experiment-context';
import { v4 as uuid } from 'uuid';
import { isEmpty } from "../utility/string-util";
import { reducer } from "../reducers/home-reducer";

type UploadMessage = {
  message: string
  isError: boolean
}

export default function Home() {
  const classes = useStyles()
  const router: NextRouter = useRouter()
  const { state, dispatch } = useGlobal()
  const [isSnackbarOpen, setSnackbarOpen] = useState(false)
  const [deletionState, dispatchDeletion] = useReducer(reducer, { experimentsToDelete: [] })
  const [uploadMessage, setUploadMessage] = useState<UploadMessage>( { message: "Drag file here", isError: false })

  const onDrop = useCallback(acceptedFiles => {
    const reader = new FileReader()
    reader.onabort = () => setUploadMessage({ message: 'Upload aborted', isError: false })
    reader.onerror = () => setUploadMessage({ message: 'Upload failed', isError: true })
    reader.onprogress = () => setUploadMessage({ message: 'Loading file...', isError: false })
    reader.onload = () => load(reader)
    reader.readAsText(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const load = (reader: FileReader) => {
    const binaryResult: string | ArrayBuffer = reader.result
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

  const saveAndRedirect = async (experiment: ExperimentType) => {
    const id: string = experiment.id
    if (state.useLocalStorage) {
      try {
        localStorage.setItem(id, JSON.stringify({ experiment }))
        router.push(`${paths.experiment}/${id}`)
      } catch (e) {
        console.error('Unable to use local storage')
        setUploadMessage({ message: 'Upload failed', isError: true })
      }
    } else {
      await saveExperiment(experiment)
      router.push(`${paths.experiment}/${id}`)
    }
  }

  const createNewExperiment = () => {
    deleteExperiments()
    router.push(`${paths.experiment}/${uuid()}`)
  }

  const openSavedExperiment = (key: string) => {
    deleteExperiments()
    router.push(`${paths.experiment}/${key}`)
  }

  const getExperimentName = (key: string) => {
    try {
      const json: any = JSON.parse(localStorage.getItem(key))
      const experiment: ExperimentType = json.experiment
      return !isEmpty(experiment.info.name) ? experiment.info.name : "-"
    } catch(e) {
      console.error('Error parsing saved experiment')
    }
    return key
  }

  const deleteExperiment = (e: MouseEvent, id: string) => {
    e.stopPropagation()
    dispatchDeletion( { type: "addExperimentForDeletion", payload: id } )
    setSnackbarOpen(true)
  }

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
    deleteExperiments()
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
            <Typography variant="h4">
              Get started
            </Typography>
          </Box>

          <Box p={0} pl={1} mb={1} className={classes.box}>
            <List component="nav">
              <ListItem button onClick={() => createNewExperiment()}>
                <ListItemText primaryTypographyProps={{ variant: "h6" }} primary="Create new experiment" />
                <ChevronRightIcon />
              </ListItem>
            </List>
          </Box>

          <Box p={3} pb={1} mb={1} className={classes.box}>
            <Typography variant="h6">
              Upload experiment file
            </Typography>
            <Box mb={5} className={classes.uploadBox} {...getRootProps()}>
              <SystemUpdateAltIcon className={classes.uploadIcon} />
              <input {...getInputProps()} />
              <div className={classes.uploadBoxInner}>
                <Typography variant="body1" color={uploadMessage.isError ? 'error' : 'inherit'}>
                  <b>{uploadMessage.message}</b>
                </Typography>
              </div>
            </Box>
          </Box>

          {state.useLocalStorage &&
            <Box p={3} className={classes.box}>
              <Typography variant="h6">
                Saved experiments
              </Typography>
              <Box mb={1}>
                {state.experimentsInLocalStorage.length > 0 ?
                  <List component="nav">
                    {state.experimentsInLocalStorage
                      .filter(id => deletionState.experimentsToDelete.indexOf(id) === -1)
                      .map((id, i) => 
                        <ListItem key={i} button onClick={() => openSavedExperiment(id)}>
                          <ListItemIcon>
                            <IconButton 
                              edge="start" 
                              onClick={(e: MouseEvent) => deleteExperiment(e, id)}>
                              <DeleteIcon 
                                color="secondary"
                                fontSize="small"/>
                            </IconButton>
                          </ListItemIcon>
                          <ListItemText
                            primary={getExperimentName(id)}
                            secondary={id}
                            secondaryTypographyProps={{ color: "inherit" }} />
                          <ChevronRightIcon />
                        </ListItem>
                    )}
                  </List>
                  :
                  <Typography variant="body2">
                    There are no saved experiments
                  </Typography>
                }
              </Box>
            </Box>
          }

        </CardContent>
      </Card>

      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message={
          <>
            <Typography variant="body1">
              {`Experiment${deletionState.experimentsToDelete.length > 1 ? 's' : ''} deleted:`}
            </Typography>
            {deletionState.experimentsToDelete.map(e => 
              <Typography variant="body2">{e}</Typography>
            )}
          </>
        }
        action={
          <Button 
            color="secondary" 
            size="small"
            onClick={() => undoDeleteExperiment()}>Undo</Button>
        }/>
    </Layout>
  );
}