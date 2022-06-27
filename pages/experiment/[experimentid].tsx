import { useRouter } from 'next/router'
import { ExperimentProvider } from '../../context/experiment-context'
import TabbedExperiment from '../../components/experiment/tabbed-experiment'
import Experiment from '../../components/experiment/experiment'
import DebugExperiment from '../../components/debug-experiment'
import { useGlobal } from '../../context/global-context'
import LoadingExperiment from '../../components/experiment/loading-experiment'
import JsonEditor from '../../components/json-editor/json-editor'

export default function ExperimentContainer() {
  const router = useRouter()
  const { experimentid } = router.query
  const {
    state: { debug, showJsonEditor, focus },
  } = useGlobal()

  if (!experimentid) {
    return <LoadingExperiment />
  }
  return (
    <>
      <ExperimentProvider
        experimentId={
          Array.isArray(experimentid) ? experimentid[0] : experimentid
        }
      >
        {focus === 'legacy' ? <Experiment /> : <TabbedExperiment />}
        {debug && <DebugExperiment />}
        {showJsonEditor && <JsonEditor />}
      </ExperimentProvider>
    </>
  )
}
