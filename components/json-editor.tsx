import { Box, Button, Card, CardContent, TextareaAutosize, Typography } from '@material-ui/core'
import { ChangeEvent, useState } from 'react'
import { useExperiment, saveExperiment } from "../context/experiment-context"
import useStyles from '../styles/json-editor.style'
import { ExperimentType } from '../types/common'

type JsonEditorProps = {
    allowSaveToServer: boolean
}

export default function JsonEditor(props: JsonEditorProps) {
    const { allowSaveToServer } = props
    const classes = useStyles()
    const { state, dispatch } = useExperiment()
    const [editedExperiment, setEditedExperiment] = useState<string>(JSON.stringify(state.experiment, null, 2))

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
                <Box>
                    <Typography variant="body2">
                        Warning! The JSON below does not automatically sync with the UI. Reload the page to update it.
                    </Typography>
                </Box>
                <TextareaAutosize 
                    className={classes.textArea}
                    defaultValue={editedExperiment}
                    onChange={(e: ChangeEvent) => handleChange(e)} />
                <Box>
                    <Button 
                        size="small"
                        variant="outlined"
                        onClick={() => handleSave()}>Update experiment</Button>
                </Box>   
            </CardContent>
        </Card>
    )
}