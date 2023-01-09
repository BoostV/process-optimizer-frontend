import { ExperimentProvider } from '@process-optimizer-frontend/core'
import TabbedExperiment from '@sample/components/experiment/tabbed-experiment'
import Experiment from '@sample/components/experiment/experiment'
import DebugExperiment from '@sample/components/experiment/debug-experiment'
import { useGlobal } from '@sample/context/global'
import { useParams } from 'react-router-dom'
import { LoadingExperiment } from '@sample/components/experiment/loading-experiment'
import JsonEditor from '@sample/components/json-editor/json-editor'

export default function ExperimentContainer() {
  const { experimentId } = useParams()
  const {
    state: { debug, showJsonEditor, focus },
  } = useGlobal()

  if (!experimentId) {
    return <LoadingExperiment />
  }
  return (
    <>
      <ExperimentProvider
        experimentId={
          Array.isArray(experimentId) ? experimentId[0] ?? '' : experimentId
        }
      >
        {focus === 'legacy' ? <Experiment /> : <TabbedExperiment />}
        {debug && <DebugExperiment />}
        {showJsonEditor && <JsonEditor />}
      </ExperimentProvider>
    </>
  )
}
