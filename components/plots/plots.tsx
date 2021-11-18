import { useExperiment } from "../../context/experiment-context"
import useStyles from "./plots.style"
import { TitleCard } from "../title-card/title-card"
import { Typography, Tooltip, IconButton, Hidden } from "@material-ui/core"
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import { useGlobal } from "../../context/global-context"
import { isUIBig } from "../../utility/ui-util";
import { PlotList } from "./plot-list";
import { PlotItem } from "./plot-item";

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
            <Tooltip title={(isUIBig(global.state, "plots") ? "Collapse" : "Expand") + " 'Plots'"}>
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
          <PlotList>
            <PlotItem 
              id="objective" 
              title="Objective plot" 
              body={[
                "The objective plot displays the model approximating the objective function.",
                "In the diagonal the dependence of the model on each input variable is shown.",
                "For each input variable the other input variables are set by the best observation.",
                "In the lower triangle the pairwise dependencies of the model on each pair of input variables.",
                "For each pair the other input variables are set by the best observation.",
                "The best observation is marked with a red dot while the remaining observations are marked with orange dots."
              ]}
              maxWidth="100%"
            />
            <PlotItem 
              id="convergence" 
              title="Convergence plot" 
              body={["The convegence plot displays the score of the best observation as a function of the number of calls."]}
              width="100%"
              maxWidth={800}
            />
          </PlotList>
          :
          "Plots will appear here"
        }
      </TitleCard>
    </>
  )
}