import useStyles from './plots.style'
import { Tooltip, IconButton, Hidden } from '@mui/material'
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap'
import { PlotList } from './plot-list'
import { PlotItem } from './plot-item'
import { isPNG } from '@process-optimizer-frontend/core'
import { BokehPlot } from '@process-optimizer-frontend/plots'
import { PNGPlot } from '@process-optimizer-frontend/plots'
import { TitleCard } from '@ui/features/core/title-card/title-card'
import { FC } from 'react'
import { ExperimentType } from '@process-optimizer-frontend/core'

type Props = {
  isUIBig: boolean
  onSizeToggle: () => void
  experiment: ExperimentType
}

export const Plots: FC<Props> = ({ isUIBig, onSizeToggle, experiment }) => {
  const { classes } = useStyles()

  return (
    <>
      <TitleCard
        title={
          <>
            Plots
            <Hidden xlDown>
              <Tooltip title={(isUIBig ? 'Collapse' : 'Expand') + " 'Plots'"}>
                <IconButton
                  size="small"
                  className={classes.titleButton}
                  onClick={onSizeToggle}
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
                  plots={experiment.results.plots}
                >
                  {isPNG(plot.plot) ? (
                    <PNGPlot plot={plot.plot} />
                  ) : (
                    <BokehPlot data={plot.plot} />
                  )}
                </PlotItem>
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
                  plots={experiment.results.plots}
                >
                  {isPNG(plot.plot) ? (
                    <PNGPlot plot={plot.plot} />
                  ) : (
                    <BokehPlot data={plot.plot} />
                  )}
                </PlotItem>
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
                  plots={experiment.results.plots}
                >
                  {isPNG(plot.plot) ? (
                    <PNGPlot plot={plot.plot} />
                  ) : (
                    <BokehPlot data={plot.plot} />
                  )}
                </PlotItem>
              ))}
          </PlotList>
        ) : (
          'Plots will appear here'
        )}
      </TitleCard>
    </>
  )
}
