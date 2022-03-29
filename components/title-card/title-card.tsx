import { Box, Card, CardContent } from '@material-ui/core'
import { ReactNode } from 'react'
import useStyles from './title-card.style'

type TitleCardProps = {
  title: ReactNode
  padding?: number
  children: any
}

export const TitleCard = (props: TitleCardProps) => {
  const { title, padding, children } = props
  const classes = useStyles()

  return (
    <Card>
      <CardContent className={classes.content}>
        <Box className={classes.title}>{title}</Box>
        <Box p={padding !== undefined ? padding : 2}>{children}</Box>
      </CardContent>
    </Card>
  )
}
