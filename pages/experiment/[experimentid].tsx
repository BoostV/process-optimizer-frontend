import { useRouter } from "next/router";
import { ExperimentProvider } from "../../context/experiment-context";
import Experiment from "../../components/experiment/experiment";
import DebugExperiment from "../../components/debug-experiment";
import { useGlobal } from "../../context/global-context";
import LoadingExperiment from "../../components/experiment/loading-experiment";
import JsonEditor from "../../components/json-editor/json-editor";

export default function ExperimentContainer() {
  const router = useRouter();
  const { experimentid } = router.query;
  const { state } = useGlobal()

  if (!experimentid) {
    return <LoadingExperiment />
  }
  return (
    <>
      <ExperimentProvider experimentId={Array.isArray(experimentid) ? experimentid[0] : experimentid} useLocalStorage={state.useLocalStorage}>
        <Experiment allowSaveToServer={!state.useLocalStorage} />
        {state.debug && <DebugExperiment />}
        {state.showJsonEditor && <JsonEditor allowSaveToServer={!state.useLocalStorage}/>}
      </ExperimentProvider>
    </>
  );
}
