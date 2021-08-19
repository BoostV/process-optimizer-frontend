import { Typography, Tooltip, IconButton, Hidden } from "@material-ui/core"
import { useExperiment } from "../context/experiment-context"
import useStyles from "../styles/plots.style"
import { TitleCard } from "./title-card"
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import { useGlobal } from "../context/global-context"

export const Plots = () => {
  const { state: { experiment } } = useExperiment()
  const global = useGlobal()
  const classes = useStyles()

  return (
    <>
      <TitleCard title={
        <>
          Plots
          <Hidden lgDown>
            <Tooltip title="Expand 'Plots'">
              <IconButton 
                size="small"
                className={classes.titleButton}
                onClick={() => global.dispatch({ type: 'toggleUISize', payload: 'plots' })} >
                <ZoomOutMapIcon fontSize="small" className={classes.titleIcon} />
              </IconButton>
            </Tooltip>

          </Hidden>
        </>
      }>
        {experiment.results.plots.length > 0 ?
          <ul>
              <Typography variant="subtitle1"><b>Convergence plot</b></Typography>
              <Typography variant="body2" paragraph={true}>
                The convegence plot displays the score of the best observation as a function of the number of calls.
              </Typography>
              {experiment.results.plots.filter(plot => plot.id === "convergence").map(plot => <li className={classes.listItem} key={plot.id}><img className={classes.convergenceImage} src={`data:image/png;base64, ${plot.plot}`} alt={plot.id}></img></li>)}
              
              <Typography variant="subtitle1"><b>Objective plot</b></Typography>
              <Typography variant="body2" paragraph={true}>
                The objective plot displays the model approximating the objective function.<br/>
                In the diagonal the dependence of the model on each input variable is shown.
                For each input variable the other input variables are set by the best observation.<br/>
                In the lower triangle the pairwise dependencies of the model on each pair of input variables.
                For each pair the other input variables are set by the best observation.<br/>
                The best observation is marked with a red dot while the remaining observations are marked with orange dots.
              </Typography>
              {experiment.results.plots.filter(plot => plot.id === "objective").map(plot => <li className={classes.listItem} key={plot.id}><img className={classes.objectiveImage} src={`data:image/png;base64, ${plot.plot}`} alt={plot.id}></img></li>)}
          </ul>
          :
          "Plots will appear here"
        }
      </TitleCard>
    </>
  )
}