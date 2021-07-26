import { Box, Button, Card, CardContent, IconButton, TextareaAutosize, Typography } from '@material-ui/core'
import { ChangeEvent, useEffect, useState } from 'react'
import { useExperiment, saveExperiment } from "../context/experiment-context"
import useStyles from '../styles/json-editor.style'
import { CategoricalVariableType, DataPointType, ExperimentType, Info, OptimizerConfig, ValueVariableType } from '../types/common'
import CloseIcon from "@material-ui/icons/Close"
import { useGlobal } from '../context/global-context'

type JsonEditorProps = {
    allowSaveToServer: boolean
}

type DisplayedResults = {
    id: string
    next: (number|string)[],
    extras: object
}

type DisplayedExperiment = {
    id: string
    info: Info
    extras: object
    categoricalVariables: CategoricalVariableType[]
    valueVariables: ValueVariableType[]
    optimizerConfig: OptimizerConfig
    results: DisplayedResults
    dataPoints: DataPointType[][]
}

export default function JsonEditor(props: JsonEditorProps) {
    const { allowSaveToServer } = props
    const classes = useStyles()
    const [errorMsg, setErrorMsg] = useState('')
    const [displayedExperimentString, setDisplayedExperimentString] = useState('')
    const { state: { experiment }, dispatch, loading } = useExperiment()
    const global = useGlobal()

    useEffect(() => {
        const displayedExperiment = displayedExperimentFromExperiment(experiment)
        setDisplayedExperimentString(JSON.stringify(displayedExperiment, null, 2))
    }, [experiment])

    const displayedExperimentFromExperiment = (experiment: ExperimentType): DisplayedExperiment => {
        return {
            ...experiment,
            results: {
                id: experiment.results.id,
                next: experiment.results.next,
                extras: experiment.results.extras,
            },
        }
    }

    const experimentFromDisplayedExperiment = (displayedExperimentString: string): ExperimentType => {
        const displayedExperiment: DisplayedExperiment = JSON.parse(displayedExperimentString)
        return {
            ...displayedExperiment,
            results: {
                ...displayedExperiment.results,
                pickled: experiment.results.pickled,
                plots: experiment.results.plots
            }
        }
    }

    const handleChange = (e: ChangeEvent) => {
        const value = (e.target as HTMLInputElement).value
        setDisplayedExperimentString(value)
    }

    const handleSave = async() => {
        try {
            const experimentToSave: ExperimentType = experimentFromDisplayedExperiment(displayedExperimentString)
            if (allowSaveToServer) {
                await saveExperiment(experimentToSave)
            } else {
                dispatch({ type: 'updateExperiment', payload: experimentToSave })
            }
            location.reload()
        } catch (e) {
            setErrorMsg('Error: ' + e.message)
            console.error('Error editing json', e)
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
                        value={displayedExperimentString}
                        onChange={(e: ChangeEvent) => handleChange(e)} />
                    <Box>
                        <Button 
                            size="small"
                            variant="outlined"
                            onClick={() => handleSave()}>Update experiment</Button>
                    </Box>   
                    <Box mt={1}>
                        <Typography variant="body2" color="error">
                            {errorMsg}
                        </Typography>
                    </Box>
                  </>
                }
            </CardContent>
        </Card>
    )
}