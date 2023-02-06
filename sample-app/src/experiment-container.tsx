import { ExperimentProvider } from '@boostv/process-optimizer-frontend-core'
import TabbedExperiment from '@sample/components/experiment/tabbed-experiment'
import Experiment from '@sample/components/experiment/experiment'
import DebugExperiment from '@sample/components/experiment/debug-experiment'
import { useGlobal } from '@sample/context/global'
import { useParams } from 'react-router-dom'
import { LoadingExperiment } from '@sample/components/experiment/loading-experiment'
import JsonEditor from '@sample/components/json-editor/json-editor'
import { useEffect } from 'react'

export default function ExperimentContainer() {
  const { experimentId } = useParams()
  const {
    dispatch,
    state: { debug, showJsonEditor, focus },
  } = useGlobal()

  if (!experimentId) {
    return <LoadingExperiment />
  }
  useEffect(() => {
    if (experimentId) {
      dispatch({
        type: 'storeExperimentId',
        payload: experimentId,
      })
    }
  }, [experimentId, dispatch])
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
