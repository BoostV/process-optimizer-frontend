import { useExperiment } from "../context/experiment-context"
import { TitleCard } from "./title-card"

export const Plots = () => {
  const { state: { experiment } } = useExperiment()

  return (
    <>
      <TitleCard title="Plots">
        {experiment.results.plots.length > 0 ?
          <ul>
              {experiment.results.plots && experiment.results.plots.map(plot => <li key={plot.id}><img src={`data:image/png;base64, ${plot.plot}`} alt={plot.id}></img></li>)}
          </ul>
          :
          "Plots will appear here"
        }
      </TitleCard>
    </>
  )
}