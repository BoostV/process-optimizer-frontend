import { ExperimentProvider } from '@/context/experiment'
import TabbedExperiment from '@/components/experiment/tabbed-experiment'
import Experiment from '@/components/experiment/experiment'
import DebugExperiment from '@/components/experiment/debug-experiment'
import { useGlobal } from '@/context/global'
import { useParams } from 'react-router-dom'
import LoadingExperiment from '@/components/experiment/loading-experiment'
import JsonEditor from '@/components/json-editor/json-editor'

export default function ExperimentContainer() {
  const { experimentId } = useParams()
  console.log(experimentId)
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
