import { useExperiment } from "../context/experiment-context"
import { TitleCard } from "./title-card"

export const Plots = () => {
  const { state: { experiment } } = useExperiment()

  return (
    <>
      <TitleCard title="Plots">
        {experiment.results.plots.length > 0 ?
          <ul>
              <h3>Convergence plot</h3>
              <p>The convegence plot displays the score of the best observation as a function of the number of calls.</p>
              {experiment.results.plots.filter(plot => plot.id == "convergence").map(plot => <li key={plot.id}><img src={`data:image/png;base64, ${plot.plot}`} width="800" alt={plot.id}></img></li>)}
              
              <h3>Objective plot</h3>
              <p>The objective plot displays the model approximating the objective function.<br/>
              In the diagonal the dependence of the model on each input variable is shown.
              For each input variable the other input variables are set by the best observation.<br/>
              In the lower triangle the pairwise dependencies of the model on each pair of input variables.
              For each pair the other input variables are set by the best observation.<br/>
              The best observation is marked with a red dot while the remaining observations are marked with orange dots.</p>
               {experiment.results.plots.filter(plot => plot.id == "objective").map(plot => <li key={plot.id}><img src={`data:image/png;base64, ${plot.plot}`} width="800" alt={plot.id}></img></li>)}
          </ul>
          :
          "Plots will appear here"
        }
      </TitleCard>
    </>
  )
}