import { Fragment } from 'react'
import { Typography } from '@mui/material'
import { useExperiment } from '../../context/experiment'
import useStyles from './plot-item.style'

interface PlotItemProps {
  id: string
  title: string
  body: string[]
  width?: number | string
  maxWidth?: number | string
}

export const PlotItem = ({
  id,
  title,
  body,
  width,
  maxWidth,
}: PlotItemProps) => {
  const {
    state: { experiment },
  } = useExperiment()
  const classes = useStyles()

  return (
    <>
      <Typography variant="subtitle1">
        <b>{title}</b>
      </Typography>
      <Typography variant="body2" paragraph={true}>
        {body.map((b, i) => (
          <Fragment key={i}>
            {b}
            <br />
          </Fragment>
        ))}
      </Typography>
      {experiment.results.plots
        .filter(plot => plot.id === id)
        .map(plot => (
          <li className={classes.listItem} key={plot.id}>
            {
              // eslint-disable-next-line @next/next/no-img-element
              <img
                style={{ width: width || 'auto', maxWidth: maxWidth || 'none' }}
                src={`data:image/png;base64, ${plot.plot}`}
                alt={plot.id}
              />
            }
          </li>
        ))}
    </>
  )
}
