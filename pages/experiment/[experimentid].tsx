import { useRouter } from "next/router";
import { ExperimentProvider } from "../../context/experiment-context";
import Experiment from "../../components/experiment";
import DebugExperiment from "../../components/debugexperiment";
import { useGlobal } from "../../context/global-context";
import LoadingExperiment from "../../components/loading-experiment";

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
      </ExperimentProvider>
    </>
  );
}
