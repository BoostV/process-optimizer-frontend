import { useExperiment } from '../../context/experiment-context'
import useStyles from './plots.style'
import { TitleCard } from '../title-card/title-card'
import { Tooltip, IconButton, Hidden } from '@mui/material'
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap'
import { useGlobal } from '../../context/global-context'
import { isUIBig } from '../../utility/ui-util'
import { PlotList } from './plot-list'
import { PlotItem } from './plot-item'

export const Plots = () => {
  const {
    state: { experiment },
  } = useExperiment()
  const global = useGlobal()
  const classes = useStyles()

  return (
    <>
      <TitleCard
        title={
          <>
            Plots
            <Hidden xlDown>
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
                    global.dispatch({ type: 'toggleUISize', payload: 'plots' })
                  }
                >
                  <ZoomOutMapIcon
                    fontSize="small"
                    className={classes.titleIcon}
                  />
                </IconButton>
              </Tooltip>
            </Hidden>
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
