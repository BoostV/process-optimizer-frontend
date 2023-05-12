import useStyles from './plots.style'
import { Tooltip, IconButton, Hidden, Stack, Skeleton } from '@mui/material'
import { ZoomOutMap } from '@mui/icons-material'
import { PlotList } from './plot-list'
import { PlotItem } from './plot-item'
import { isPNG } from '@boostv/process-optimizer-frontend-core'
import { BokehPlot } from '@boostv/process-optimizer-frontend-plots'
import { PNGPlot } from '@boostv/process-optimizer-frontend-plots'
import { TitleCard } from '@ui/features/core/title-card/title-card'
import { FC, ReactNode } from 'react'
import { ExperimentType } from '@boostv/process-optimizer-frontend-core'

type Props = {
  id?: string
  isUIBig?: boolean
  onSizeToggle?: () => void
  experiment: ExperimentType
  loading?: boolean
  loadingView?: ReactNode
  warning?: string
}

export const Plots: FC<Props> = ({
  id = 'plots',
  isUIBig = false,
  onSizeToggle,
  experiment,
  loading,
  loadingView,
  warning,
}) => {
  const { classes } = useStyles()

  const defaultLoadingView = (
    <Stack direction="column" spacing={2}>
      <Skeleton
        animation="wave"
        variant="rectangular"
        width="100%"
        height={600}
      />
      <Skeleton
        animation="wave"
        variant="rectangular"
        width="100%"
        height={800}
      />
    </Stack>
  )
  const plotsLoadingView = loadingView ? loadingView : defaultLoadingView

  return (
    <>
      <TitleCard
        id={id}
        loading={loading}
        loadingView={plotsLoadingView}
        warning={warning}
        title={
          <>
            Plots
            {onSizeToggle !== undefined && (
              <Hidden xlDown>
                <Tooltip
                  disableInteractive
                  title={(isUIBig ? 'Collapse' : 'Expand') + " 'Plots'"}
                >
                  <IconButton
                    size="small"
                    className={classes.titleButton}
                    onClick={onSizeToggle}
                  >
                    <ZoomOutMap
                      fontSize="small"
                      className={classes.titleIcon}
                    />
                  </IconButton>
                </Tooltip>
              </Hidden>
            )}
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
