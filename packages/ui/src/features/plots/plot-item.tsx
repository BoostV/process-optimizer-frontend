import React, { Fragment } from 'react'
import { Typography } from '@mui/material'
import useStyles from './plot-item.style'

interface PlotItemProps {
  id: string
  title: string
  body: string[]
  width?: number | string
  maxWidth?: number | string
  plots: { id: string; plot: string }[]
  children: React.ReactElement<{
    width?: number | string
    maxWidth?: number | string
  }>
}

export const PlotItem = ({
  id,
  title,
  body,
  width,
  maxWidth,
  plots,
  children,
}: PlotItemProps) => {
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
      {plots
        .filter(plot => plot.id === id)
        .map(plot => (
          <li className={classes.listItem} key={plot.id}>
            {React.cloneElement(children, { width, maxWidth })}
          </li>
        ))}
    </>
  )
}
