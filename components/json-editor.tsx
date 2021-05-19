import { Box, Button, Card, CardContent, IconButton, TextareaAutosize, Typography } from '@material-ui/core'
import { ChangeEvent, useEffect, useState } from 'react'
import { useExperiment, saveExperiment } from "../context/experiment-context"
import useStyles from '../styles/json-editor.style'
import { ExperimentType } from '../types/common'
import CloseIcon from "@material-ui/icons/Close"
import { useGlobal } from '../context/global-context'

type JsonEditorProps = {
    allowSaveToServer: boolean
}

export default function JsonEditor(props: JsonEditorProps) {
    const { allowSaveToServer } = props
    const classes = useStyles()
    const [editedExperiment, setEditedExperiment] = useState<string>("")
    const { state: {
        experiment
    }, dispatch, loading } = useExperiment()
    const global = useGlobal()

    useEffect(() => {
      setEditedExperiment(JSON.stringify(experiment, null, 2))
    }, [experiment]) 

    const handleChange = (e: ChangeEvent) => {
        setEditedExperiment((e.target as HTMLInputElement).value)
    }

    const handleSave = async() => {
        try {
            const experimentToSave: ExperimentType = JSON.parse(editedExperiment)
            if (allowSaveToServer) {
                await saveExperiment(experimentToSave)
            } else {
                dispatch({ type: 'updateExperiment', payload: experimentToSave })
            }
            location.reload()
        } catch (e) {
            console.log('Error editing json', e)
        }
    }

    return (
        <Card>
            <CardContent>
                <Box mb={2}>
                  <IconButton 
                    size="small"
                    onClick={() => global.dispatch({ type: 'setShowJsonEditor', payload: false })}>
                    <CloseIcon />
                  </IconButton>
                </Box>
                {loading ? "Loading..." : 
                  <>
                    <Box>
                        <Typography variant="body2">
                            Warning! Only edit this JSON if you know what you are doing.
                        </Typography>
                    </Box>
                    <TextareaAutosize 
                        className={classes.textArea}
                        value={editedExperiment}
                        onChange={(e: ChangeEvent) => handleChange(e)} />
                    <Box>
                        <Button 
                            size="small"
                            variant="outlined"
                            onClick={() => handleSave()}>Update experiment</Button>
                    </Box>   
                  </>
                }
            </CardContent>
        </Card>
    )
}