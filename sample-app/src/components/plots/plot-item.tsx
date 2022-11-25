import React, { Fragment } from 'react'
import { Typography } from '@mui/material'
import { useExperiment } from '@/context/experiment'
import useStyles from './plot-item.style'

interface PlotItemProps {
  id: string
  title: string
  body: string[]
  width?: number | string
  maxWidth?: number | string
  children: React.ReactElement
}

export const PlotItem = ({
  id,
  title,
  body,
  width,
  maxWidth,
  children,
}: PlotItemProps) => {
  const {
    state: { experiment },
  } = useExperiment()
  const { classes } = useStyles()

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
        .filter((plot: any) => plot.id === id)
        .map((plot: any) => (
          <li className={classes.listItem} key={plot.id}>
            {React.cloneElement(children, { width, maxWidth })}
          </li>
        ))}
    </>
  )
}
