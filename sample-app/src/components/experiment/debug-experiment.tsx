import { Card, CardContent } from '@mui/material'
import { useExperiment } from '@boostv/process-optimizer-frontend-core'

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
