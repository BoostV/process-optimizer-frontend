import { Button, Card, CardContent, Grid, Snackbar, Typography } from '@material-ui/core'
import { useExperiment } from "../context/experiment-context"

export default function DebugExperiment() {
    const { state } = useExperiment()
    return (
        <>
            <Card>
                <CardContent>
                    <Typography variant="body2" component="p">
                        <pre>{JSON.stringify(state.experiment, null, 2)}</pre>
                    </Typography>
                </CardContent>
            </Card>
        </>
    )
}