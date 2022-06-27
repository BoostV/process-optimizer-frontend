import { useRouter } from 'next/router'
import { ExperimentProvider } from '../../src/context/experiment-context'
import TabbedExperiment from '../../src/components/experiment/tabbed-experiment'
import Experiment from '../../src/components/experiment/experiment'
import DebugExperiment from '../../src/components/debug-experiment'
import { useGlobal } from '../../src/context/global-context'
import LoadingExperiment from '../../src/components/experiment/loading-experiment'
import JsonEditor from '../../src/components/json-editor/json-editor'

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
          Array.isArray(experimentid) ? experimentid[0] ?? '' : experimentid
        }
      >
        {focus === 'legacy' ? <Experiment /> : <TabbedExperiment />}
        {debug && <DebugExperiment />}
        {showJsonEditor && <JsonEditor />}
      </ExperimentProvider>
    </>
  )
}
