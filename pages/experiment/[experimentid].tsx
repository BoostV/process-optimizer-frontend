import { useRouter } from 'next/router'
import { ExperimentProvider, useExperiment } from '../../context/experiment-context';
import Experiment from '../../components/experiment';

export default function ExperimentContainer() {
  const router = useRouter()
  const { experimentid } = router.query

  return (
    <ExperimentProvider experimentId={experimentid} useLocalStorage={ true }>
      <Experiment/>
    </ExperimentProvider>
  )
}