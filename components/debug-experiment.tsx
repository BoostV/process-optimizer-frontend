import { Card, CardContent } from '@material-ui/core'
import { useExperiment } from "../context/experiment-context"

export default function DebugExperiment() {
    const { state } = useExperiment()
    return (
        <Card>
            <CardContent>
                <pre>{JSON.stringify(state.experiment, null, 2)}</pre>
            </CardContent>
        </Card>
    )
}
