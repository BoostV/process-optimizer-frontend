import { ReactNode } from 'react'
import useStyles from './plot-list.style'

interface PlotListProps {
  children: ReactNode
}

export const PlotList = ({ children }: PlotListProps) => {
  const { classes } = useStyles()

  return <ul className={classes.list}>{children}</ul>
}
