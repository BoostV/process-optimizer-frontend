import { ExperimentProvider } from '@/context/experiment'
import TabbedExperiment from '@/components/experiment/tabbed-experiment'
import Experiment from '@/components/experiment/experiment'
import DebugExperiment from '@/components/experiment/debug-experiment'
import { useGlobal } from '@/context/global'
import LoadingExperiment from '@/components/experiment/loading-experiment'
import JsonEditor from '@/components/json-editor/json-editor'

export default function ExperimentContainer(props: { experimentId: string }) {
  const {
    state: { debug, showJsonEditor, focus },
  } = useGlobal()

  if (!props.experimentId) {
    return <LoadingExperiment />
  }
  return (
    <>
      <ExperimentProvider
        experimentId={
          Array.isArray(props.experimentId)
            ? props.experimentId[0] ?? ''
            : props.experimentId
        }
      >
        {focus === 'legacy' ? <Experiment /> : <TabbedExperiment />}
        {debug && <DebugExperiment />}
        {showJsonEditor && <JsonEditor />}
      </ExperimentProvider>
    </>
  )
}
