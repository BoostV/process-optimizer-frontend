import { useExperiment } from '../../context/experiment-context'
import useStyles from './plots.style'
import { TitleCard } from '../title-card/title-card'
import {
  Typography,
  Tooltip,
  IconButton,
  Hidden,
  Switch,
  FormControlLabel,
  Box,
} from '@material-ui/core'
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap'
import { useGlobal } from '../../context/global-context'
import { isUIBig } from '../../utility/ui-util'
import { PlotList } from './plot-list'
import { PlotItem } from './plot-item'
import { Label } from 'recharts'

export const Plots = () => {
  const {
    state: { experiment },
    dispatch,
  } = useExperiment()
  const global = useGlobal()
  const classes = useStyles()

  const toggleShowConfidence = () =>
    dispatch({ type: 'experiment/toggleShowConfidence' })

  return (
    <>
      <TitleCard
        title={
          <>
            <Box display="flex" justifyContent="space-between">
              <Box>Plots</Box>
              <Box>
                <Tooltip title="Enable/disable the appereance of confidence intervals for the Objective plot">
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={experiment.extras['includeConfidence'] ?? true}
                        onChange={toggleShowConfidence}
                        name="confidence"
                      />
                    }
                    label="Confidence interval"
                  />
                </Tooltip>
                <Hidden lgDown>
                  <Tooltip
                    title={
                      (isUIBig(global.state, 'plots') ? 'Collapse' : 'Expand') +
                      " 'Plots'"
                    }
                  >
                    <IconButton
                      size="small"
                      className={classes.titleButton}
                      onClick={() =>
                        global.dispatch({
                          type: 'toggleUISize',
                          payload: 'plots',
                        })
                      }
                    >
                      <ZoomOutMapIcon
                        fontSize="small"
                        className={classes.titleIcon}
                      />
                    </IconButton>
                  </Tooltip>
                </Hidden>
              </Box>
            </Box>
          </>
        }
      >
        {experiment.results.plots.length > 0 ? (
          <PlotList>
            {experiment.results.plots
              .filter(plot => plot.id.includes('objective'))
              .map((plot, idx) => (
                <PlotItem
                  id={plot.id}
                  key={plot.id}
                  title="Objective plot"
                  body={
                    idx === 0
                      ? [
                          'The objective plot displays the model approximating the objective function.',
                          'In the diagonal the dependence of the model on each input variable is shown.',
                          'For each input variable the other input variables are set by the best observation.',
                          'In the lower triangle the pairwise dependencies of the model on each pair of input variables.',
                          'For each pair the other input variables are set by the best observation.',
                          'The best observation is marked with a red dot while the remaining observations are marked with orange dots.',
                        ]
                      : []
                  }
                  maxWidth="100%"
                />
              ))}

            {experiment.results.plots
              .filter(plot => plot.id.includes('convergence'))
              .map((plot, idx) => (
                <PlotItem
                  id={plot.id}
                  key={plot.id}
                  title="Convergence plot"
                  body={
                    idx === 0
                      ? [
                          'The convegence plot displays the score of the best observation as a function of the number of calls.',
                        ]
                      : []
                  }
                  width="100%"
                  maxWidth={800}
                />
              ))}
            {experiment.results.plots
              .filter(plot => plot.id.includes('pareto'))
              .map(plot => (
                <PlotItem
                  key={plot.id}
                  id={plot.id}
                  title="Pareto"
                  body={[]}
                  maxWidth={800}
                />
              ))}
          </PlotList>
        ) : (
          'Plots will appear here'
        )}
      </TitleCard>
    </>
  )
}
