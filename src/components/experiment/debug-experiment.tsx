import { Card, CardContent } from '@mui/material'
import { useExperiment } from '../../context/experiment'

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
