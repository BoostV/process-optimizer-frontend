import { useRouter } from "next/router";
import {
  ExperimentProvider,
  useExperiment,
} from "../../context/experiment-context";
import Experiment from "../../components/experiment";
import DebugExperiment from "../../components/debugexperiment";

export default function ExperimentContainer() {
  const router = useRouter();
  const { experimentid } = router.query;

  if (!experimentid) {
    return <div>Loading experiment</div>;
  }
  return (
    <ExperimentProvider experimentId={Array.isArray(experimentid) ? experimentid[0] : experimentid} useLocalStorage={true}>
      <Experiment />
      <DebugExperiment />
    </ExperimentProvider>
  );
}
