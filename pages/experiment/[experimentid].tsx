import { useRouter } from "next/router";
import { ExperimentProvider } from "../../context/experiment-context";
import Experiment from "../../components/experiment";
import DebugExperiment from "../../components/debugexperiment";
import { useGlobal } from "../../context/global-context";

export default function ExperimentContainer() {
  const router = useRouter();
  const { experimentid } = router.query;
  const { state } = useGlobal()

  if (!experimentid) {
    return <div>Loading experiment</div>;
  }
  return (
    <>
      <ExperimentProvider experimentId={Array.isArray(experimentid) ? experimentid[0] : experimentid} useLocalStorage={state.useLocalStorage}>
        <Experiment />
        {state.debug && <DebugExperiment />}
      </ExperimentProvider>
    </>
  );
}
